import { Observable, map, shareReplay } from 'rxjs';
import { reefState, network } from '@reef-chain/util-lib';
import { Network as ReactNetwork } from '@reef-chain/react-lib';

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

export const selectedNetworkDex$: Observable<DexNetwork> = reefState.selectedNetwork$.pipe(
  map((nw: Network) => ({ ...nw, ...dexConfig[nw.name], ...bondsConfig[nw.name] })),
  shareReplay(1),
);
