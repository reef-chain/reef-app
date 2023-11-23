import { Observable, map, shareReplay } from 'rxjs';
import { reefState,network } from '@reef-chain/util-lib';
import {Bond, Network as UtilLibNetwork} from "@reef-chain/util-lib/dist/network"

export interface Network extends UtilLibNetwork{
  factoryAddress:string;
  routerAddress:string;
  graphqlDexsUrl:string;
  bond:Bond[];
}

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
  mainnet:{
    bonds: network.bonds.testnet,
  },
  testnet:{
    bonds: network.bonds.testnet,
  }
}

export type DexNetwork = Network;

export const selectedNetworkDex$: Observable<DexNetwork> = reefState.selectedNetwork$.pipe(
  map((network: Network) => ({ ...network, ...dexConfig[network.name],...bondsConfig[network.name] })),
  shareReplay(1),
);
