import type { MetaMaskInpageProvider } from '@metamask/providers';
import { GetSnapsResponse, Snap } from '../pages/snap/types';
import { extension as reefExt } from '@reef-chain/util-lib';

const SNAP_ID = reefExt.SNAP_ID;

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
      [SNAP_ID]: {},
    },
  });
};

export const getSnap = async (): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(snap => snap.id === SNAP_ID);
  } catch (error) {
    console.log('Failed to obtain installed snap', error);
    return undefined;
  }
};

export const isLocalSnap = () => SNAP_ID.startsWith('local:');

export const sendToSnap = async (
  message: string,
  request?: any,
): Promise<any> => {
  console.log('sendToSnap', message, request);
  const res = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: SNAP_ID,
      request: {
        method: message,
        params: request || {},
      },
    },
  });
  return res;
};
