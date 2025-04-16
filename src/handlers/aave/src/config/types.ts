import { BigNumberish } from 'ethers';

export interface Chain {
  id: number;
  name: string;
  rpcUrl: string;
  poolAddress: string;
  poolDataProviderAddress: string;
  flashLoanAddress: string;
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  isAToken?: boolean;
  underlyingAsset?: string;
}

export interface ReserveConfiguration {
  ltv: BigNumberish;
  liquidationThreshold: BigNumberish;
  liquidationBonus: BigNumberish;
  reserveFactor: BigNumberish;
  usageAsCollateralEnabled: boolean;
  borrowingEnabled: boolean;
  stableBorrowRateEnabled: boolean;
  isActive: boolean;
  isFrozen: boolean;
}

export interface InterestRateStrategy {
  variableRateSlope1: BigNumberish;
  variableRateSlope2: BigNumberish;
  stableRateSlope1: BigNumberish;
  stableRateSlope2: BigNumberish;
  baseStableBorrowRate: BigNumberish;
  baseVariableBorrowRate: BigNumberish;
  optimalUsageRatio: BigNumberish;
  maxExcessUsageRatio: BigNumberish;
}

export interface ReserveData {
  configuration: ReserveConfiguration;
  liquidityIndex: BigNumberish;
  variableBorrowIndex: BigNumberish;
  currentLiquidityRate: BigNumberish;
  currentVariableBorrowRate: BigNumberish;
  currentStableBorrowRate: BigNumberish;
  lastUpdateTimestamp: number;
  aTokenAddress: string;
  stableDebtTokenAddress: string;
  variableDebtTokenAddress: string;
  interestRateStrategyAddress: string;
  availableLiquidity: BigNumberish;
  totalPrincipalStableDebt: BigNumberish;
  averageStableRate: BigNumberish;
  stableDebtLastUpdateTimestamp: number;
  totalScaledVariableDebt: BigNumberish;
  priceInEth: BigNumberish;
} 