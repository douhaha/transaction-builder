import { z } from "zod";
import { BuildTransactionResponse, CreateTransactionResponse, TransactionHandler } from "../TransactionHandler";
import { OrbiterClient, ENDPOINT, RouterType, ConfigOptions, TradePair } from "@orbiter-finance/bridge-sdk";
import { EVM_CHAIN_IDS, getEvmProvider, validateEvmAddress, validateEvmChain } from "../../utils/evm";
import { ethers } from "ethers";

const config: ConfigOptions = {
  apiEndpoint: ENDPOINT.MAINNET,
  defaultRouterType: RouterType.EOA,
};

const PayloadSchema = z.object({
  srcChain: z.string().nonempty("Missing required field: srcChain"),
  dstChain: z.string().nonempty("Missing required field: dstChain"),
  srcTokenSymbol: z.string().toUpperCase().nonempty("Missing required field: srcTokenSymbol"),
  dstTokenSymbol: z.string().toUpperCase().nonempty("Missing required field: dstTokenSymbol"),
  amount: z.string().regex(/^\d+(\.\d+)?$/, "Amount must be a valid number string"),
});

type Payload = z.infer<typeof PayloadSchema>;

export class OrbiterHandler implements TransactionHandler {

  async create(payload: Payload): Promise<CreateTransactionResponse> {
    const validation = PayloadSchema.safeParse(payload);

    if (!validation.success) {
      throw new Error(validation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "));
    }

    payload = validation.data;
    validateEvmChain(payload.srcChain);
    validateEvmChain(payload.dstChain);

    const orbiter = await OrbiterClient.create(config);

    getTradePair(orbiter, payload.srcChain, payload.srcTokenSymbol, payload.dstChain, payload.dstTokenSymbol);

    return {
      chain: payload.srcChain,
      data: payload,
    };
  }

  async build(data: Payload, address: string): Promise<BuildTransactionResponse> {
    validateEvmAddress(address);

    const provider = getEvmProvider(data.srcChain);

    const orbiter = await OrbiterClient.create(config);

    const tradePair = getTradePair(orbiter, data.srcChain, data.srcTokenSymbol, data.dstChain, data.dstTokenSymbol);

    const router = orbiter.createRouter(tradePair);

    const min = Number(router.getMinSendAmount());
    const max = Number(router.getMaxSendAmount());

    if (Number(data.amount) < min || Number(data.amount) > max) {
      throw new Error(`Amount: ${data.amount} must be between ${min} and ${max}`);
    }

    const { sendAmount } = router.simulationAmount(data.amount);

    const transaction = await router.createTransaction(address, address, sendAmount);
    
    const rawData = transaction.raw as {
      to: string;
      data: string;
      value: string;
    };

    const feeData = await provider.getFeeData();

    const { maxFeePerGas, maxPriorityFeePerGas } = feeData;

    if (!maxFeePerGas || !maxPriorityFeePerGas) {
      throw new Error("Missing fee data");
    }

    const unsignedTx: ethers.TransactionLike = {
      chainId: EVM_CHAIN_IDS[data.srcChain],
      type: 2,
      ...rawData,
      maxFeePerGas: maxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas,
    };
    const serializedTx = ethers.Transaction.from(unsignedTx).unsignedSerialized;

    return {
      transactions: [
        {
          hex: serializedTx,
        },
      ],
    };
  }
}

function getTradePair(orbiter: OrbiterClient, srcChain: string, srcTokenSymbol: string, dstChain: string, dstTokenSymbol: string): TradePair {
  const tradePairs: TradePair[] = orbiter.getAvailableTradePairs(EVM_CHAIN_IDS[srcChain].toString(), srcTokenSymbol);

  if (tradePairs.length === 0) {
    throw new Error(`No trade pairs found for ${srcChain} ${srcTokenSymbol}`);
  }

  const tradePair = tradePairs.find(
    (pair) => pair.dstChainId === EVM_CHAIN_IDS[dstChain].toString() && pair.dstTokenSymbol === dstTokenSymbol
  );

  if (!tradePair) {
    throw new Error(
      `No trade pair found for ${srcChain} ${srcTokenSymbol} to ${dstChain} ${dstTokenSymbol}`
    );
  }

  return tradePair;
}