import type { MetaMaskInpageProvider } from '@metamask/providers';
import { GetSnapsResponse, Snap } from '../pages/wallets/types';

// TODO: set snapId when it is available
export const snapId = "local:http://localhost:8080";

export const getSnaps = async (
  provider?: MetaMaskInpageProvider,
): Promise<GetSnapsResponse> =>
  (await (provider ?? window.ethereum).request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;

export const connectSnap = async () => {
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapId]: {},
    },
  });
};

export const getSnap = async (): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(snap => snap.id === snapId);
  } catch (error) {
    console.log('Failed to obtain installed snap', error);
    return undefined;
  }
};

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');

export const sendToSnap = async (
  message: string,
  request?: any,
): Promise<any> => {
  const res = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: snapId,
      request: {
        method: message,
        params: request || {},
      },
    },
  });
  return res;
};
