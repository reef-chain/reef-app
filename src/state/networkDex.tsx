import { network } from '@reef-chain/util-lib';
import { useEffect, useState } from 'react';
import { Bond, Network as UtilLibNetwork } from '@reef-chain/util-lib/dist/network';

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

interface ExtendedNetwork extends UtilLibNetwork{
  factoryAddress:string;
  routerAddress:string;
  graphqlDexsUrl:string;
  bonds:Bond[];
}
export type Network = ExtendedNetwork;

export const useNetworkDex = (nw: UtilLibNetwork):Network => {
  const [dexNetwork, setDexNetwork] = useState<Network>();

  useEffect(() => {
    setDexNetwork({
      ...nw,
      ...dexConfig[nw.name],
      ...bondsConfig[nw.name],
    });
  }, [nw]);

  return dexNetwork;
};
