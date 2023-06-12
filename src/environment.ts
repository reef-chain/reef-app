import { availableNetworks, Network } from '@reef-defi/react-lib';

export const isReefswapUI = window.location.host.indexOf('reefswap') > -1;
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

export const isAddressWhitelisted = (addr: string | undefined, network: Network) => {
  if (!addr || !network) {
    return false;
  }
  const isRsUI = isReefswapUI;
  if (addr && network && isRsUI && network?.name === availableNetworks.testnet.name) {
    return whitelistedAddresses.some((a) => a === addr);
  }
  return true;
};
