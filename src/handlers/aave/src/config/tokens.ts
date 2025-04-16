import { Token } from './types';

export const SUPPORTED_TOKENS: Record<number, Token[]> = {
  // Ethereum Mainnet
  1: [
    {
      address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', // AAVE
      symbol: 'AAVE',
      name: 'Aave Token',
      decimals: 18,
      chainId: 1,
    },
    {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      chainId: 1,
    },
    {
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
      symbol: 'WBTC',
      name: 'Wrapped BTC',
      decimals: 8,
      chainId: 1,
    },
    {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 1,
    },
  ],
  // Polygon
  137: [
    {
      address: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B', // AAVE
      symbol: 'AAVE',
      name: 'Aave Token',
      decimals: 18,
      chainId: 137,
    },
    {
      address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // WMATIC
      symbol: 'WMATIC',
      name: 'Wrapped Matic',
      decimals: 18,
      chainId: 137,
    },
    {
      address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', // WBTC
      symbol: 'WBTC',
      name: 'Wrapped BTC',
      decimals: 8,
      chainId: 137,
    },
    {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 137,
    },
  ],
  // Avalanche
  43114: [
    {
      address: '0x63a72806098Bd3D9520cC43356dD78afe5D386D9', // AAVE
      symbol: 'AAVE',
      name: 'Aave Token',
      decimals: 18,
      chainId: 43114,
    },
    {
      address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', // WAVAX
      symbol: 'WAVAX',
      name: 'Wrapped AVAX',
      decimals: 18,
      chainId: 43114,
    },
    {
      address: '0x50b7545627a5162F82A992c33b87aDc75187B218', // WBTC
      symbol: 'WBTC',
      name: 'Wrapped BTC',
      decimals: 8,
      chainId: 43114,
    },
    {
      address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 43114,
    },
  ],
  // Arbitrum
  42161: [
    {
      address: '0xba5DdD1f9d7F570dc94a51479a000E3BCE967196', // AAVE
      symbol: 'AAVE',
      name: 'Aave Token',
      decimals: 18,
      chainId: 42161,
    },
    {
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      chainId: 42161,
    },
    {
      address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', // WBTC
      symbol: 'WBTC',
      name: 'Wrapped BTC',
      decimals: 8,
      chainId: 42161,
    },
    {
      address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // USDC
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 42161,
    },
  ],
  // Optimism
  10: [
    {
      address: '0x76FB31fb4af56892A25e32cFC43De717950c9278', // AAVE
      symbol: 'AAVE',
      name: 'Aave Token',
      decimals: 18,
      chainId: 10,
    },
    {
      address: '0x4200000000000000000000000000000000000006', // WETH
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      chainId: 10,
    },
    {
      address: '0x68f180fcCe6836688e9084f035309E29Bf0A2095', // WBTC
      symbol: 'WBTC',
      name: 'Wrapped BTC',
      decimals: 8,
      chainId: 10,
    },
    {
      address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', // USDC
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 10,
    },
  ],
}; 