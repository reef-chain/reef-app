import { network as nw } from '@reef-chain/util-lib';
import { useEffect, useState } from 'react';

export const isReefswapUI = window.location.host.indexOf('reefswap') > -1;

if (isReefswapUI) {
  document.title = 'ReefSwap DEX';
}
export const getIpfsGatewayUrl = (hash: string): string => `https://reef.infura-ipfs.io/ipfs/${hash}`;
export const appAvailableNetworks = [nw.AVAILABLE_NETWORKS.mainnet, nw.AVAILABLE_NETWORKS.testnet];
export const binanceConnectApiUrl = 'https://onramp.reefscan.info';

export const formoApiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmlnaW4iOiJodHRwczovL2FwcC5yZWVmLmlvIiwicHJvamVjdF9pZCI6IjNSQWZuNGZrR0o4dnI3bERmMHFGZCIsImlhdCI6MTc2NjA3MzgwOH0.1coWZO-PV7JHv5_duD9Wmkyd4ivVygrHqtsaUZEF1S8";

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
