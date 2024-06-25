import { ReefSigner } from '@reef-chain/react-lib';
import axios, { AxiosResponse } from 'axios';
import { extension } from '@reef-chain/util-lib';
import { extension as extReef } from '@reef-chain/util-lib';
import {
  AddressNonceMessage,
  AuthenticationResponse,
  BuyPair,
  BuyPayload, Trade,
} from './models';
import { binanceConnectApiUrl } from '../../environment';

const { web3FromSource, web3Enable, web3Accounts } = extension;
const binanceConnectApi = axios.create({ baseURL: binanceConnectApiUrl });

const getAuthHeader = (jwt: string): Record<string, unknown> => ({
  headers: {
    Authorization: `Bearer ${jwt}`,
  },
});

function get<T = unknown>(url: string): Promise<T> {
  return binanceConnectApi.get<void, AxiosResponse<T>>(url)
    .then((response: AxiosResponse<T>): T => response.data);
}

function post<T = unknown>(url: string, payload: unknown, config?: Record<string | number, unknown>): Promise<T> {
  return binanceConnectApi.post<void, AxiosResponse<T>>(url, payload, config)
    .then((response: AxiosResponse<T>): T => response.data);
}

export const getPairs = (): Promise<BuyPair[]> => get<BuyPair[]>('/get-pairs');

export const getNetwork = (): Promise<unknown> => binanceConnectApi.get<void, AxiosResponse<BuyPair[]>>('/get-network');

export const createTrade = (payload: BuyPayload, jwt: string): Promise<Trade> => post<Trade>('/buy', payload, getAuthHeader(jwt));

export const getAddressNonceMessage = (address: string): Promise<AddressNonceMessage> => get<AddressNonceMessage>(`/auth/${address}`);

export const authenticateDEV = (signer: ReefSigner): Promise<AuthenticationResponse> => get<string>(`/test/generate-jwt/${signer.address}`)
  .then((token: string) => ({ authenticated: true, token } as AuthenticationResponse));

export const authenticate = async (signer: ReefSigner): Promise<AuthenticationResponse | undefined> => {
  const { message } = await getAddressNonceMessage(signer.address);
  await extReef.web3Enable('Reef App');
  const [account] = await extReef.web3Accounts();
  const injector = await extReef.web3FromSource(account.meta.source);
  const signRaw = await injector?.signer?.signRaw;

  if (signRaw != null) {
    const { signature } = await signRaw({
      address: signer.address,
      data: message,
      type: 'bytes',
    });

    return post<AuthenticationResponse>('/jwt', { address: signer.address, signature });
  }

  return undefined;
};
