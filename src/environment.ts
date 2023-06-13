import { availableNetworks, Network } from '@reef-defi/react-lib';

export const isReefswapUI = window.location.host.indexOf('reefswap') > -1;

if (isReefswapUI) {
  console.warn('Setting testnet for reefswap promo period!');
  localStorage.setItem('reef-app-active-network', '{"name":"testnet","rpcUrl":"wss://rpc-testnet.reefscan.info/ws","reefscanUrl":"https://testnet.reefscan.info","verificationApiUrl":"https://api-testnet.reefscan.com","factoryAddress":"0x06D7a7334B9329D0750FFd0a636D6C3dFA77E580","routerAddress":"0xa29DFc7329ac30445Ba963E313fD26E171722057","graphqlExplorerUrl":"wss://squid.subsquid.io/reef-explorer-testnet/graphql","graphqlDexsUrl":"https://squid.subsquid.io/reef-swap-testnet/graphql","genesisHash":"0x0f89efd7bf650f2d521afef7456ed98dff138f54b5b7915cc9bce437ab728660","bonds":[]}');
}

export const testnetOverride = {
  ...availableNetworks.testnet,
  rpcUrl: 'wss://rpc-testnet.reefscan.com/ws',
  verificationApiUrl: 'https://api-testnet.reefscan.info',
} as Network;
// export const mainnetOverride = { ...availableNetworks.testnet, rpcUrl: 'wss://rpc.reefscan.com/ws', verificationApiUrl: 'https://api-testnet.reefscan.info' } as Network;
export const appAvailableNetworks = [availableNetworks.mainnet, testnetOverride];
export const getAppNetworkOverride = (network: Network): Network => appAvailableNetworks.find((net) => net.name === network.name) || network;
// export const appAvailableNetworks = [availableNetworks.mainnet, availableNetworks.testnet];
export const binanceConnectApiUrl = 'https://onramp.reefscan.info';

export const whitelistedAddresses = ['5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP'];

export const isAddressWhitelisted = (addr: string | undefined, network: Network): boolean => {
  if (!addr || !network) {
    return false;
  }
  const isRsUI = isReefswapUI;
  if (addr && network && isRsUI && network?.name === availableNetworks.testnet.name) {
    return whitelistedAddresses.some((a) => a === addr);
  }
  return true;
};
