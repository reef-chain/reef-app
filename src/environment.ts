import { network as nw } from '@reef-chain/util-lib';
import { useEffect, useState } from 'react';

export const isReefswapUI = window.location.host.indexOf('reefswap') > -1;

if (isReefswapUI) {
  document.title = 'ReefSwap DEX';
}
export const getIpfsGatewayUrl = (hash: string): string => `https://reef.infura-ipfs.io/ipfs/${hash}`;
export const appAvailableNetworks = [nw.AVAILABLE_NETWORKS.mainnet, nw.AVAILABLE_NETWORKS.testnet];
export const binanceConnectApiUrl = 'https://onramp.reefscan.info';

export const formoApiKey = isReefswapUI?"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmlnaW4iOiJodHRwczovL3JlZWZzd2FwLmNvbS8iLCJwcm9qZWN0X2lkIjoiZnBtUWYySlVuQU5MamZDTWdmSkFzIiwiaWF0IjoxNzY2NDExOTY4fQ.ts-JpGetb6K6Ggn444oZFjH0pLfLqLLbnlaqspeSVhw":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmlnaW4iOiJodHRwczovL2FwcC5yZWVmLmlvIiwicHJvamVjdF9pZCI6IlFtM3ZxTGd4dUZOblpVMmlHV3g2YSIsImlhdCI6MTc2NjE1MTg3Nn0.FZ6x8vm7s72MAtGj4MYOBm3p1R5oFVGPEGPBZO2mj8Y";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

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
