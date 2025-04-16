import { BigNumberish } from 'ethers';

export interface AaveV3Config {
  poolAddress: string;
  poolDataProviderAddress: string;
  flashLoanAddress: string;
}

export interface ReserveData {
  underlyingAsset: string;
  name: string;
  symbol: string;
  decimals: number;
  baseLTVasCollateral: BigNumberish;
  reserveLiquidationThreshold: BigNumberish;
  reserveLiquidationBonus: BigNumberish;
  reserveFactor: BigNumberish;
  usageAsCollateralEnabled: boolean;
  borrowingEnabled: boolean;
  stableBorrowRateEnabled: boolean;
  isActive: boolean;
  isFrozen: boolean;
  liquidityIndex: BigNumberish;
  variableBorrowIndex: BigNumberish;
  liquidityRate: BigNumberish;
  variableBorrowRate: BigNumberish;
  stableBorrowRate: BigNumberish;
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
  variableRateSlope1: BigNumberish;
  variableRateSlope2: BigNumberish;
  stableRateSlope1: BigNumberish;
  stableRateSlope2: BigNumberish;
  baseStableBorrowRate: BigNumberish;
  baseVariableBorrowRate: BigNumberish;
  optimalUsageRatio: BigNumberish;
  maxExcessUsageRatio: BigNumberish;
}

export interface UserReserveData {
  underlyingAsset: string;
  scaledATokenBalance: BigNumberish;
  usageAsCollateralEnabledOnUser: boolean;
  stableBorrowRate: BigNumberish;
  scaledVariableDebt: BigNumberish;
  principalStableDebt: BigNumberish;
  stableBorrowLastUpdateTimestamp: number;
}

export interface FlashLoanParams {
  receiverAddress: string;
  assets: string[];
  amounts: BigNumberish[];
  interestRateModes: number[];
  onBehalfOf: string;
  params: string;
  referralCode: number;
}

export interface SupplyParams {
  asset: string;
  amount: BigNumberish;
  onBehalfOf?: string;
  referralCode?: number;
}

export interface WithdrawParams {
  asset: string;
  amount: BigNumberish;
  to: string;
}

export interface BorrowParams {
  asset: string;
  amount: BigNumberish;
  interestRateMode: number;
  referralCode?: number;
  onBehalfOf?: string;
}

export interface RepayParams {
  asset: string;
  amount: BigNumberish;
  rateMode: number;
  onBehalfOf?: string;
}

export interface LiquidationParams {
  collateralAsset: string;
  debtAsset: string;
  user: string;
  debtToCover: BigNumberish;
  receiveAToken: boolean;
}
