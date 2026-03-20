import axios from 'axios';
import { reefscanApiUrl } from '../../environment';

const letsexchangeApi = axios.create({
  baseURL: `${reefscanApiUrl}/letsexchange`,
  timeout: 20000,
});

export interface LetsExchangeCurrency {
  symbol: string;
  name: string;
  icon: string;
  network: string;
  networkName: string;
  hasExtra: boolean;
  extraName: string | null;
  explorer: string | null;
  contractAddress: string | null;
  validationAddressRegex: string | null;
  validationAddressExtraRegex: string | null;
  chainId: string | null;
  isWalletConnect: boolean;
  isDefaultNetwork: boolean;
  defaultNetwork: string;
  defaultNetworkName: string;
  additionalInfoGet: string;
  additionalInfoSend: string;
}

export interface LetsExchangeQuote {
  amount: string;
  rate: string;
  fee?: string;
  min_amount?: string;
  max_amount?: string;
  deposit_min_amount?: string;
  deposit_max_amount?: string;
  withdrawal_fee?: string;
  expired_at?: string | number;
  rate_id?: string;
  rate_id_expired_at?: string | number;
}

export interface LetsExchangeTransaction {
  transaction_id: string;
  status: string;
  coin_from: string;
  coin_to: string;
  coin_from_network: string;
  coin_to_network: string;
  deposit_amount: string;
  withdrawal_amount: string;
  deposit: string;
  deposit_extra_id: string | null;
  withdrawal: string;
  withdrawal_extra_id: string | null;
  rate: string;
  expired_at: string | number;
  created_at?: string;
  coin_from_explorer_url?: string;
  coin_to_explorer_url?: string;
  coin_from_name?: string;
  coin_to_name?: string;
  coin_from_icon?: string;
  coin_to_icon?: string;
  need_confirmations?: number;
  confirmations?: number;
}

type ApiEnvelope<T> = {
  data: T;
  error?: string;
};

const unwrap = <T>(response: { data: ApiEnvelope<T> }): T => {
  if (response.data?.error) {
    throw new Error(response.data.error);
  }

  return response.data.data;
};

const toError = (error: unknown, fallbackMessage: string): Error => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as { error?: string } | undefined;
    return new Error(responseData?.error || error.message || fallbackMessage);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(fallbackMessage);
};

export const listCurrencies = async ({
  search,
  limit = 500,
  offset = 0,
}: {
  search?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<LetsExchangeCurrency[]> => {
  try {
    const response = await letsexchangeApi.get<ApiEnvelope<LetsExchangeCurrency[]>>('/listcurrencies', {
      params: {
        limit,
        offset: offset || undefined,
        search: search || undefined,
      },
    });

    return unwrap(response) || [];
  } catch (error) {
    throw toError(error, 'Failed to load LetsExchange currencies');
  }
};

export const getQuote = async (
  payload: { fromSymbol: string; fromNetwork: string; amount?: number; withdrawalAmount?: number },
  mode: 'from' | 'to',
): Promise<LetsExchangeQuote> => {
  try {
    const response = await letsexchangeApi.post<ApiEnvelope<LetsExchangeQuote>>(
      mode === 'from' ? '/quote' : '/quote-revert',
      mode === 'from'
        ? {
          fromSymbol: payload.fromSymbol,
          fromNetwork: payload.fromNetwork,
          amount: payload.amount,
        }
        : {
          fromSymbol: payload.fromSymbol,
          fromNetwork: payload.fromNetwork,
          withdrawalAmount: payload.withdrawalAmount,
        },
    );

    return unwrap(response);
  } catch (error) {
    throw toError(error, 'Failed to fetch LetsExchange quote');
  }
};

export const createExchange = async (
  payload: {
    fromSymbol: string;
    fromNetwork: string;
    withdrawalAddress: string;
    depositAmount?: number;
    withdrawalAmount?: number;
  },
): Promise<LetsExchangeTransaction> => {
  try {
    const response = await letsexchangeApi.post<ApiEnvelope<LetsExchangeTransaction>>('/create-exchange', payload);
    return unwrap(response);
  } catch (error) {
    throw toError(error, 'Failed to create LetsExchange swap');
  }
};

export const getTransaction = async (transactionId: string): Promise<LetsExchangeTransaction> => {
  try {
    const response = await letsexchangeApi.get<ApiEnvelope<LetsExchangeTransaction>>(`/transaction/${transactionId}`);
    return unwrap(response);
  } catch (error) {
    throw toError(error, 'Failed to load LetsExchange transaction');
  }
};

export const getTransactionStatus = async (transactionId: string): Promise<string> => {
  try {
    const response = await letsexchangeApi.get<ApiEnvelope<string>>(`/transaction/${transactionId}/status`);
    return unwrap(response);
  } catch (error) {
    throw toError(error, 'Failed to load LetsExchange transaction status');
  }
};
