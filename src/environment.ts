import { network as nw } from '@reef-chain/util-lib';
import type { Network } from './state/networkDex';

export const isReefswapUI = window.location.host.indexOf('reefswap') > -1;

if (isReefswapUI) {
  console.warn('Setting testnet for reefswap promo period!');
  localStorage.setItem('reef-app-active-network', '{"name":"testnet","rpcUrl":"wss://rpc-testnet.reefscan.info/ws","reefscanUrl":"https://testnet.reefscan.info","verificationApiUrl":"https://api-testnet.reefscan.com","factoryAddress":"0x06D7a7334B9329D0750FFd0a636D6C3dFA77E580","routerAddress":"0xa29DFc7329ac30445Ba963E313fD26E171722057","graphqlExplorerUrl":"wss://squid.subsquid.io/reef-explorer-testnet/graphql","graphqlDexsUrl":"https://squid.subsquid.io/reef-swap-testnet/graphql","genesisHash":"0x0f89efd7bf650f2d521afef7456ed98dff138f54b5b7915cc9bce437ab728660","bonds":[]}');
  document.title = 'ReefSwap dApp';
}
export const getIpfsGatewayUrl = (hash: string): string => `https://reef.infura-ipfs.io/ipfs/${hash}`;
export const testnetOverride = {
  ...nw.AVAILABLE_NETWORKS.testnet,
  rpcUrl: 'wss://rpc-testnet.reefscan.com/ws',
  verificationApiUrl: 'https://api-testnet.reefscan.info',
} as Network;

// export const mainnetOverride = { ...availableNetworks.testnet, rpcUrl: 'wss://rpc.reefscan.com/ws', verificationApiUrl: 'https://api-testnet.reefscan.info' } as Network;
export const appAvailableNetworks = [nw.AVAILABLE_NETWORKS.mainnet, testnetOverride];
export const getAppNetworkOverride = (network: Network): Network => appAvailableNetworks.find((net) => net.name === network.name) || network;
// export const appAvailableNetworks = [availableNetworks.mainnet, availableNetworks.testnet];
export const binanceConnectApiUrl = 'https://onramp.reefscan.info';
