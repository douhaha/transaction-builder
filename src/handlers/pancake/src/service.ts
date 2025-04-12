import { ChainId, Token, WETH9, Fetcher, Route, Trade, TradeType, Percent } from '@pancakeswap/sdk';
import { Contract, JsonRpcProvider, BigNumberish } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';
import { 
  PoolInfo, 
  PositionInfo, 
  AddLiquidityParams, 
  RemoveLiquidityParams, 
  StakeParams,
  PoolSearchParams,
  FEE_TIERS,
  TOKEN_ADDRESSES,
  LPPosition,
  UserAssets,
  TokenPrice
} from './types';

const PANCAKE_ROUTER_ADDRESS = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
const PANCAKE_FACTORY_ADDRESS = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73';
const PANCAKE_NFT_POSITIONS_ADDRESS = '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364';
const PANCAKE_MASTER_CHEF_ADDRESS = '0x73feaa1eE314F8c655E354234017bE2193C9E24E';
const CAKE_TOKEN_ADDRESS = '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82';

export class PancakeService {
  private provider: JsonRpcProvider;
  private router: Contract;
  private factory: Contract;
  private nftPositions: Contract;
  private masterChef: Contract;
  private priceCache: Map<string, TokenPrice>;
  private readonly PRICE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(provider: JsonRpcProvider) {
    this.provider = provider;
    this.priceCache = new Map();
    this.router = new Contract(
      PANCAKE_ROUTER_ADDRESS,
      [
        'function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)',
        'function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, uint deadline) external returns (uint amountA, uint amountB)',
      ],
      provider
    );
    this.factory = new Contract(
      PANCAKE_FACTORY_ADDRESS,
      [
        'function getPair(address tokenA, address tokenB) external view returns (address pair)',
        'function allPairs(uint) external view returns (address pair)',
        'function allPairsLength() external view returns (uint)',
      ],
      provider
    );
    this.nftPositions = new Contract(
      PANCAKE_NFT_POSITIONS_ADDRESS,
      [
        'function positions(uint256 tokenId) external view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)',
        'function balanceOf(address owner) external view returns (uint256)',
        'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)',
      ],
      provider
    );
    this.masterChef = new Contract(
      PANCAKE_MASTER_CHEF_ADDRESS,
      [
        'function userInfo(uint256 pid, address user) external view returns (uint256 amount, uint256 rewardDebt)',
        'function poolInfo(uint256 pid) external view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accCakePerShare)',
      ],
      provider
    );
  }

  async createPool(token0: string, token1: string, fee: number): Promise<string> {
    // Get token symbols from the token addresses
    const token0Contract = new Contract(token0, ['function symbol() view returns (string)'], this.provider);
    const token1Contract = new Contract(token1, ['function symbol() view returns (string)'], this.provider);
    
    const [token0Symbol, token1Symbol] = await Promise.all([
      token0Contract.symbol(),
      token1Contract.symbol()
    ]);

    const tokenA = new Token(ChainId.BSC, token0 as `0x${string}`, 18, token0Symbol);
    const tokenB = new Token(ChainId.BSC, token1 as `0x${string}`, 18, token1Symbol);
    
    const [token0Addr, token1Addr] = tokenA.sortsBefore(tokenB) 
      ? [token0, token1] 
      : [token1, token0];

    const tx = await this.factory.createPool(token0Addr, token1Addr, fee);
    const receipt = await tx.wait();
    return receipt.events[0].args.pool;
  }

  async getTopPools(params: PoolSearchParams): Promise<PoolInfo[]> {
    // Implementation would depend on available APIs or subgraph queries
    // This is a placeholder implementation
    const pools: PoolInfo[] = [];
    // TODO: Implement actual pool fetching logic using PancakeSwap's subgraph
    return pools;
  }

  async addLiquidity(params: AddLiquidityParams): Promise<PositionInfo> {
    const tx = await this.router.addLiquidity(
      params.token0,
      params.token1,
      params.amount0Desired,
      params.amount1Desired,
      params.amount0Min,
      params.amount1Min,
      params.deadline
    );

    const receipt = await tx.wait();
    const tokenId = receipt.events[0].args.tokenId;
    return this.getPositionInfo(tokenId);
  }

  async removeLiquidity(params: RemoveLiquidityParams): Promise<void> {
    const tx = await this.router.removeLiquidity(
      params.tokenId,
      params.liquidity,
      params.amount0Min,
      params.amount1Min,
      params.deadline
    );
    await tx.wait();
  }

  async stake(params: StakeParams): Promise<void> {
    const tx = await this.masterChef.deposit(0, params.amount, params.tokenId);
    await tx.wait();
  }

  async getPositionInfo(tokenId: number): Promise<PositionInfo> {
    const position = await this.nftPositions.positions(tokenId);
    return {
      tokenId,
      liquidity: position.liquidity,
      token0Amount: position.amount0,
      token1Amount: position.amount1,
      feeGrowthInside0LastX128: position.feeGrowthInside0LastX128,
      feeGrowthInside1LastX128: position.feeGrowthInside1LastX128,
    };
  }

  async findHighYieldPools(minTVL: number = 100000, minVolume24h: number = 50000, minAPY: number = 20): Promise<PoolInfo[]> {
    // Get all pools from the factory
    const pools = await this.getTopPools({});
    
    const highYieldPools: PoolInfo[] = [];
    
    for (const pool of pools) {
      // Get pool TVL (Total Value Locked)
      const tvl = await this.getPoolTVL(pool.address);
      
      // Get 24h volume
      const volume24h = await this.getPoolVolume24h(pool.address);
      
      // Calculate APY based on fees and TVL
      const apy = await this.calculatePoolAPY(pool.address);
      
      if (tvl >= minTVL && volume24h >= minVolume24h && apy >= minAPY) {
        highYieldPools.push({
          ...pool,
          tvl,
          volume24h,
          apy
        });
      }
    }
    
    // Sort pools by APY in descending order
    return highYieldPools.sort((a, b) => b.apy - a.apy);
  }

  private async getPoolTVL(poolAddress: string): Promise<number> {
    // Implementation to get pool's TVL
    // This would typically involve querying the pool contract for token balances
    // and getting their USD values
    return 0; // Placeholder
  }

  private async getPoolVolume24h(poolAddress: string): Promise<number> {
    // Implementation to get pool's 24h trading volume
    // This would typically involve querying historical swap events
    return 0; // Placeholder
  }

  private async calculatePoolAPY(poolAddress: string): Promise<number> {
    // Implementation to calculate pool's APY
    // This would typically involve:
    // 1. Getting pool's fee rate
    // 2. Getting historical trading volume
    // 3. Calculating annualized returns based on fees collected
    return 0; // Placeholder
  }

  private async getTokenPrice(token: Token): Promise<number> {
    const cacheKey = token.address.toLowerCase();
    const cached = this.priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.PRICE_CACHE_TTL) {
      return cached.price;
    }

    try {
      // Try to get price from WBNB pair first
      const wbnbToken = WETH9[ChainId.BSC];
      const pair = await Fetcher.fetchPairData(token, wbnbToken, this.provider as any);
      const route = new Route([pair], token, wbnbToken);
      const price = parseFloat(route.midPrice.toSignificant(6));

      this.priceCache.set(cacheKey, {
        token,
        price,
        timestamp: Date.now()
      });

      return price;
    } catch (error) {
      console.error(`Failed to get price for ${token.symbol}:`, error);
      return 0;
    }
  }

  private async getTokenPrices(tokens: Token[]): Promise<Map<string, number>> {
    const prices = new Map<string, number>();
    const pricePromises = tokens.map(async token => {
      const price = await this.getTokenPrice(token);
      prices.set(token.address.toLowerCase(), price);
    });
    await Promise.all(pricePromises);
    return prices;
  }

  private async calculateLPTVL(pair: any, totalSupply: BigNumberish, prices: Map<string, number>): Promise<BigNumberish> {
    const [reserve0, reserve1] = await Promise.all([
      pair.reserve0,
      pair.reserve1
    ]);

    const price0 = prices.get(pair.token0.address.toLowerCase()) || 0;
    const price1 = prices.get(pair.token1.address.toLowerCase()) || 0;

    const tvl = (parseFloat(reserve0.toString()) * price0) + (parseFloat(reserve1.toString()) * price1);
    return tvl.toString();
  }

  private async calculateLPAPY(pair: any, tvl: BigNumberish): Promise<number> {
    try {
      const volume24h = await pair.volume24h();
      const feeRate = pair.fee / 1000000;
      const fees24h = parseFloat(volume24h.toString()) * feeRate;
      const apy = (fees24h * 365) / parseFloat(tvl.toString()) * 100;
      return apy;
    } catch (error) {
      console.error(`Failed to calculate APY for pair ${pair.token0.symbol}/${pair.token1.symbol}:`, error);
      return 0;
    }
  }

  async getUserAssets(walletAddress: string): Promise<UserAssets> {
    try {
      // Get common tokens
      const tokens = await Promise.all([
        Fetcher.fetchTokenData(ChainId.BSC, TOKEN_ADDRESSES.CAKE, this.provider as any, 'CAKE', 'PancakeSwap Token'),
        WETH9[ChainId.BSC],
        Fetcher.fetchTokenData(ChainId.BSC, TOKEN_ADDRESSES.BUSD, this.provider as any, 'BUSD', 'Binance USD'),
        Fetcher.fetchTokenData(ChainId.BSC, TOKEN_ADDRESSES.USDT, this.provider as any, 'USDT', 'Tether USD'),
        Fetcher.fetchTokenData(ChainId.BSC, TOKEN_ADDRESSES.USDC, this.provider as any, 'USDC', 'USD Coin'),
        Fetcher.fetchTokenData(ChainId.BSC, TOKEN_ADDRESSES.DAI, this.provider as any, 'DAI', 'Dai Stablecoin'),
        Fetcher.fetchTokenData(ChainId.BSC, TOKEN_ADDRESSES.ETH, this.provider as any, 'ETH', 'Ethereum'),
        Fetcher.fetchTokenData(ChainId.BSC, TOKEN_ADDRESSES.BTCB, this.provider as any, 'BTCB', 'Bitcoin BEP20'),
        Fetcher.fetchTokenData(ChainId.BSC, TOKEN_ADDRESSES.DOT, this.provider as any, 'DOT', 'Polkadot'),
        Fetcher.fetchTokenData(ChainId.BSC, TOKEN_ADDRESSES.LINK, this.provider as any, 'LINK', 'Chainlink'),
      ]);

      // Get token prices
      const prices = await this.getTokenPrices(tokens);

      // Get pairs
      const pairs = await Promise.all([
        Fetcher.fetchPairData(tokens[0], tokens[1], this.provider as any), // CAKE/WBNB
        Fetcher.fetchPairData(tokens[0], tokens[2], this.provider as any), // CAKE/BUSD
        Fetcher.fetchPairData(tokens[0], tokens[3], this.provider as any), // CAKE/USDT
        Fetcher.fetchPairData(tokens[1], tokens[2], this.provider as any), // WBNB/BUSD
        Fetcher.fetchPairData(tokens[1], tokens[3], this.provider as any), // WBNB/USDT
        Fetcher.fetchPairData(tokens[2], tokens[3], this.provider as any), // BUSD/USDT
        Fetcher.fetchPairData(tokens[1], tokens[6], this.provider as any), // WBNB/ETH
        Fetcher.fetchPairData(tokens[1], tokens[7], this.provider as any), // WBNB/BTCB
      ]);

      // Get CAKE token contract
      const cakeContract = new Contract(
        TOKEN_ADDRESSES.CAKE,
        ['function balanceOf(address owner) external view returns (uint256)'],
        this.provider
      );

      const [cakeBalance, cakeStaked] = await Promise.all([
        cakeContract.balanceOf(walletAddress),
        this.masterChef.userInfo(0, walletAddress).then(info => info.amount)
      ]);

      const cakePrice = prices.get(TOKEN_ADDRESSES.CAKE.toLowerCase()) || 0;
      const cakeValue = BigNumber.from(cakeBalance)
        .add(BigNumber.from(cakeStaked))
        .mul(Math.floor(cakePrice * 1e18))
        .div(1e18);

      const assets: UserAssets = {
        cake: {
          balance: cakeBalance.toString(),
          staked: cakeStaked.toString(),
          price: cakePrice,
          value: cakeValue.toString()
        },
        lpPositions: [],
        totalValue: cakeValue.toString()
      };

      // Get LP positions
      for (const pair of pairs) {
        const lpTokenContract = new Contract(
          pair.liquidityToken.address,
          [
            'function balanceOf(address owner) external view returns (uint256)',
            'function totalSupply() external view returns (uint256)',
          ],
          this.provider
        );

        const [balance, totalSupply] = await Promise.all([
          lpTokenContract.balanceOf(walletAddress),
          lpTokenContract.totalSupply()
        ]);

        const staked = await this.masterChef.userInfo(0, walletAddress).then(info => info.amount);

        if (BigNumber.from(balance).gt(0) || BigNumber.from(staked).gt(0)) {
          const tvl = await this.calculateLPTVL(pair, totalSupply, prices);
          const apy = await this.calculateLPAPY(pair, tvl);
          const price0 = prices.get(pair.token0.address.toLowerCase()) || 0;
          const price1 = prices.get(pair.token1.address.toLowerCase()) || 0;
          
          const lpValue = BigNumber.from(balance)
            .add(BigNumber.from(staked))
            .mul(Math.floor(parseFloat(tvl.toString()) / parseFloat(totalSupply.toString()) * 1e18))
            .div(1e18);

          assets.lpPositions.push({
            pair: `${pair.token0.symbol}/${pair.token1.symbol}`,
            token0: pair.token0,
            token1: pair.token1,
            balance: balance.toString(),
            staked: staked.toString(),
            tvl: tvl.toString(),
            apy,
            price0,
            price1,
            value: lpValue.toString()
          });

          assets.totalValue = BigNumber.from(assets.totalValue).add(lpValue).toString();
        }
      }

      return assets;
    } catch (error) {
      console.error('Failed to get user assets:', error);
      throw error;
    }
  }
} 