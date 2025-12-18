import { network as nw } from '@reef-chain/util-lib';
import { useEffect, useState } from 'react';

export const isReefswapUI = window.location.host.indexOf('reefswap') > -1;

if (isReefswapUI) {
  document.title = 'ReefSwap DEX';
}
export const getIpfsGatewayUrl = (hash: string): string => `https://reef.infura-ipfs.io/ipfs/${hash}`;
export const appAvailableNetworks = [nw.AVAILABLE_NETWORKS.mainnet, nw.AVAILABLE_NETWORKS.testnet];
export const binanceConnectApiUrl = 'https://onramp.reefscan.info';

// generate new one for app.reef.io and replace it here
export const formoApiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmlnaW4iOiJodHRwczovL3JlZWYuaW8iLCJwcm9qZWN0X2lkIjoid2lsMGJMR1NrUURucWx4TDc4bHgyIiwiaWF0IjoxNzY1OTgyNDI5fQ.aPap3ykS2g1QFg1roeTWrSv7XO47tnh6fl7-xo1NyVQ"; //https://zana-arthrosporic-janie.ngrok-free.dev got this using $ngrok http 3000 --host-header="localhost:3000"

export const useDexConfig = (network: nw.Network): nw.DexProtocolv2 | undefined => {
  const [dexConfig, setDexConfig] = useState<nw.DexProtocolv2 | undefined>(undefined);

  useEffect(() => {
    const fetchDexConfig = async ():Promise<void> => {
      try {
        const config = nw.getReefswapNetworkConfig(network);
        setDexConfig(config);
      } catch (error) {
        console.error('Error fetching dex config:', error);
        setDexConfig(null);
      }
    };

    fetchDexConfig().then();
  }, [network]);

  return dexConfig;
};
