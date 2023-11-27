import { Observable, map, shareReplay } from 'rxjs';
import { network, reefState } from '@reef-chain/util-lib';
import { Network as ReactNetwork } from '@reef-chain/react-lib';
import { useEffect, useState } from 'react';

export type Network = ReactNetwork;

const dexConfig = {
  mainnet: {
    factoryAddress: network.getReefswapNetworkConfig(network.AVAILABLE_NETWORKS.mainnet).factoryAddress,
    routerAddress: network.getReefswapNetworkConfig(network.AVAILABLE_NETWORKS.mainnet).routerAddress,
    graphqlDexsUrl: network.getReefswapNetworkConfig(network.AVAILABLE_NETWORKS.mainnet).graphqlDexsUrl,
  },
  testnet: {
    factoryAddress: network.getReefswapNetworkConfig(network.AVAILABLE_NETWORKS.testnet).factoryAddress,
    routerAddress: network.getReefswapNetworkConfig(network.AVAILABLE_NETWORKS.testnet).routerAddress,
    graphqlDexsUrl: network.getReefswapNetworkConfig(network.AVAILABLE_NETWORKS.testnet).graphqlDexsUrl,
  },
};

const bondsConfig = {
  mainnet: {
    bonds: network.bonds.testnet,
  },
  testnet: {
    bonds: network.bonds.testnet,
  },
};

export type DexNetwork = Network;

export const useNetworkDex = (nw: Network) => {
  const [dexNetwork, setDexNetwork] = useState<DexNetwork>();

  useEffect(() => {
    setDexNetwork({
      ...nw,
      ...dexConfig[nw.name],
      ...bondsConfig[nw.name],
    });
  }, [nw]);

  return dexNetwork;
};
