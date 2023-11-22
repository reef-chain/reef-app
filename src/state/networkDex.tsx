import { Observable, map, shareReplay } from 'rxjs';
import { reefState,network } from '@reef-chain/util-lib';

export type Network = typeof network.Network;

const dexConfig = {
  mainnet: {
    factoryAddress: network.getReefswapNetworkConfig(network.AVAILABLE_NETWORKS.mainnet).factoryAddress,
    routerAddress: network.getReefswapNetworkConfig(network.AVAILABLE_NETWORKS.mainnet).routerAddress,
  },
  testnet: {
    factoryAddress: network.getReefswapNetworkConfig(network.AVAILABLE_NETWORKS.testnet).factoryAddress,
    routerAddress: network.getReefswapNetworkConfig(network.AVAILABLE_NETWORKS.testnet).routerAddress,
  },
};

export type DexNetwork = Network;

export const selectedNetworkDex$: Observable<DexNetwork> = reefState.selectedNetwork$.pipe(
  map((network: Network) => ({ ...network, ...dexConfig[network.name] })),
  shareReplay(1),
);
