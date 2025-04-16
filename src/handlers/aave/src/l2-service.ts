import { ethers } from 'ethers';
import { SUPPORTED_CHAINS, SUPPORTED_TOKENS, Chain, Token } from './config';
import {
  AaveV3Config,
  ReserveData,
  UserReserveData,
  FlashLoanParams,
  SupplyParams,
  WithdrawParams,
  BorrowParams,
  RepayParams,
  LiquidationParams,
} from './types';

// L2-specific ABI with optimizations
const L2_POOL_ABI = [
  'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
  'function withdraw(address asset, uint256 amount, address to)',
  'function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)',
  'function repay(address asset, uint256 amount, uint256 rateMode, address onBehalfOf)',
  'function liquidationCall(address collateralAsset, address debtAsset, address user, uint256 debtToCover, bool receiveAToken)',
  'function flashLoan(address receiverAddress, address[] calldata assets, uint256[] calldata amounts, uint256[] calldata interestRateModes, address onBehalfOf, bytes calldata params, uint16 referralCode)',
  // L2-specific functions
  'function supplyWithPermit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode, uint256 deadline, uint8 v, bytes32 r, bytes32 s)',
  'function repayWithPermit(address asset, uint256 amount, uint256 rateMode, address onBehalfOf, uint256 deadline, uint8 v, bytes32 r, bytes32 s)',
];

// L2-specific Data Provider ABI
const L2_POOL_DATA_PROVIDER_ABI = [
  'function getReserveData(address asset) view returns (tuple(address underlyingAsset, string name, string symbol, uint8 decimals, uint256 baseLTVasCollateral, uint256 reserveLiquidationThreshold, uint256 reserveLiquidationBonus, uint256 reserveFactor, bool usageAsCollateralEnabled, bool borrowingEnabled, bool stableBorrowRateEnabled, bool isActive, bool isFrozen, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 liquidityRate, uint128 variableBorrowRate, uint128 stableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 availableLiquidity, uint128 totalPrincipalStableDebt, uint128 averageStableRate, uint40 stableDebtLastUpdateTimestamp, uint128 totalScaledVariableDebt, uint128 priceInEth, uint128 variableRateSlope1, uint128 variableRateSlope2, uint128 stableRateSlope1, uint128 stableRateSlope2, uint128 baseStableBorrowRate, uint128 baseVariableBorrowRate, uint128 optimalUsageRatio, uint128 maxExcessUsageRatio))',
  'function getUserReserveData(address asset, address user) view returns (tuple(address underlyingAsset, uint256 scaledATokenBalance, bool usageAsCollateralEnabledOnUser, uint256 stableBorrowRate, uint256 scaledVariableDebt, uint256 principalStableDebt, uint40 stableBorrowLastUpdateTimestamp))',
  // L2-specific functions
  'function getReserveConfigurationData(address asset) view returns (tuple(uint256 ltv, uint256 liquidationThreshold, uint256 liquidationBonus, uint256 reserveFactor, bool usageAsCollateralEnabled, bool borrowingEnabled, bool stableBorrowRateEnabled, bool isActive, bool isFrozen))',
  'function getReserveInterestRateStrategyAddress(address asset) view returns (address)',
];

export class AaveV3L2Service {
  private pool: ethers.Contract;
  private poolDataProvider: ethers.Contract;
  private signer: ethers.Signer;
  private chain: Chain;
  private tokens: Token[];

  constructor(chainId: number, signer: ethers.Signer) {
    const chain = SUPPORTED_CHAINS[chainId];
    if (!chain) {
      throw new Error(`Chain with ID ${chainId} is not supported`);
    }

    this.chain = chain;
    this.tokens = SUPPORTED_TOKENS[chainId] || [];
    this.signer = signer;
    this.pool = new ethers.Contract(chain.poolAddress, L2_POOL_ABI, signer);
    this.poolDataProvider = new ethers.Contract(
      chain.poolDataProviderAddress,
      L2_POOL_DATA_PROVIDER_ABI,
      signer
    );
  }

  getChain(): Chain {
    return this.chain;
  }

  getSupportedTokens(): Token[] {
    return this.tokens;
  }

  getTokenBySymbol(symbol: string): Token | undefined {
    return this.tokens.find(token => token.symbol === symbol);
  }

  getTokenByAddress(address: string): Token | undefined {
    return this.tokens.find(token => token.address.toLowerCase() === address.toLowerCase());
  }

  async getReserveData(asset: string): Promise<ReserveData> {
    return this.poolDataProvider.getReserveData(asset);
  }

  async getUserReserveData(asset: string, user: string): Promise<UserReserveData> {
    return this.poolDataProvider.getUserReserveData(asset, user);
  }

  async getReserveConfigurationData(asset: string) {
    return this.poolDataProvider.getReserveConfigurationData(asset);
  }

  async getReserveInterestRateStrategyAddress(asset: string) {
    return this.poolDataProvider.getReserveInterestRateStrategyAddress(asset);
  }

  async supply(params: SupplyParams): Promise<ethers.ContractTransactionResponse> {
    const { asset, amount, onBehalfOf = await this.signer.getAddress(), referralCode = 0 } = params;
    return this.pool.supply(asset, amount, onBehalfOf, referralCode);
  }

  async supplyWithPermit(
    asset: string,
    amount: BigNumberish,
    onBehalfOf: string,
    referralCode: number,
    deadline: number,
    v: number,
    r: string,
    s: string
  ): Promise<ethers.ContractTransactionResponse> {
    return this.pool.supplyWithPermit(asset, amount, onBehalfOf, referralCode, deadline, v, r, s);
  }

  async withdraw(params: WithdrawParams): Promise<ethers.ContractTransactionResponse> {
    const { asset, amount, to } = params;
    return this.pool.withdraw(asset, amount, to);
  }

  async borrow(params: BorrowParams): Promise<ethers.ContractTransactionResponse> {
    const { asset, amount, interestRateMode, referralCode = 0, onBehalfOf = await this.signer.getAddress() } = params;
    return this.pool.borrow(asset, amount, interestRateMode, referralCode, onBehalfOf);
  }

  async repay(params: RepayParams): Promise<ethers.ContractTransactionResponse> {
    const { asset, amount, rateMode, onBehalfOf = await this.signer.getAddress() } = params;
    return this.pool.repay(asset, amount, rateMode, onBehalfOf);
  }

  async repayWithPermit(
    asset: string,
    amount: BigNumberish,
    rateMode: number,
    onBehalfOf: string,
    deadline: number,
    v: number,
    r: string,
    s: string
  ): Promise<ethers.ContractTransactionResponse> {
    return this.pool.repayWithPermit(asset, amount, rateMode, onBehalfOf, deadline, v, r, s);
  }

  async liquidationCall(params: LiquidationParams): Promise<ethers.ContractTransactionResponse> {
    const { collateralAsset, debtAsset, user, debtToCover, receiveAToken } = params;
    return this.pool.liquidationCall(collateralAsset, debtAsset, user, debtToCover, receiveAToken);
  }

  async flashLoan(params: FlashLoanParams): Promise<ethers.ContractTransactionResponse> {
    const { receiverAddress, assets, amounts, interestRateModes, onBehalfOf, params: flashLoanParams, referralCode } = params;
    return this.pool.flashLoan(
      receiverAddress,
      assets,
      amounts,
      interestRateModes,
      onBehalfOf,
      flashLoanParams,
      referralCode
    );
  }
} 