import { Chain } from './types';

export const SUPPORTED_CHAINS: Record<number, Chain> = {
  // Ethereum Mainnet
  1: {
    id: 1,
    name: 'Ethereum',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
    poolAddress: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    poolDataProviderAddress: '0x7B4EB56E7CD4b454BA8ff71E4518626364d6c4c9',
    flashLoanAddress: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
  },
  // Polygon
  137: {
    id: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/your-api-key',
    poolAddress: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    poolDataProviderAddress: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    flashLoanAddress: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  },
  // Avalanche
  43114: {
    id: 43114,
    name: 'Avalanche',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    poolAddress: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    poolDataProviderAddress: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    flashLoanAddress: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  },
  // Arbitrum
  42161: {
    id: 42161,
    name: 'Arbitrum',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    poolAddress: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    poolDataProviderAddress: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    flashLoanAddress: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  },
  // Optimism
  10: {
    id: 10,
    name: 'Optimism',
    rpcUrl: 'https://mainnet.optimism.io',
    poolAddress: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    poolDataProviderAddress: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    flashLoanAddress: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  },
}; 