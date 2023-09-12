import {
  reefState, network as nw,
} from '@reef-chain/util-lib';
import { useEffect, useState } from 'react';
import { Provider } from '@reef-defi/evm-provider';
import {
  Network, ReefSigner, availableNetworks, hooks, rpc , appState } from '@reef-defi/react-lib';
import type { Signer as InjectedSigner } from '@polkadot/api/types';
import { firstValueFrom, map, skip } from 'rxjs';
import { useAsyncEffect } from './useAsyncEffect';
import { useInjectExtension } from './useInjectExtension';
import { useObservableState } from './useObservableState';

const SELECTED_ADDRESS_IDENT = 'selected_address_reef';

const getNetworkFallback = (): Network => {
  let storedNetwork;
  try {
    storedNetwork = localStorage.getItem(appState.ACTIVE_NETWORK_LS_KEY);
    storedNetwork = JSON.parse(storedNetwork);
    storedNetwork = nw.AVAILABLE_NETWORKS[storedNetwork.name];
  } catch (e) {
    // when cookies disabled localStorage can throw
  }
  return storedNetwork != null ? storedNetwork : availableNetworks.mainnet;
};

const getSelectedAddress = ():string|undefined => {
  let storedAddress:string;
  try {
    storedAddress = localStorage.getItem(SELECTED_ADDRESS_IDENT);
  } catch (e) {
    // when cookies disabled localStorage can throw
  }
  return storedAddress != null ? storedAddress : undefined;
};

const reefAccountToReefSigner = (accountsFromUtilLib:any, injectedSigner:InjectedSigner) => {
  const resultObj = {
    name: 'reef',
    sig: injectedSigner,
    accounts:[],
  };
  const reefSigners = <any[]>[];
  for (let i = 0; i < accountsFromUtilLib.length; i++) {
    const reefAccount = accountsFromUtilLib[i];
    const toReefSigner = {
      name: reefAccount.name,
      address: reefAccount.address,
      source: reefAccount.source,
      genesisHash: reefAccount.genesisHash,
    };
    reefSigners.push(toReefSigner);
  }
  resultObj.accounts = reefSigners;
  return resultObj;
};

interface State{
  error:{ code?: number; message: string; url?: string } | undefined,
  loading:boolean,
  provider:Provider|undefined,
  network: Network,
  signers:ReefSigner[],
  selectedReefSigner?:ReefSigner

}

export const useInitReefState = (
  applicationDisplayName: string,
  options:any,
): State => {
  const {
    network, ipfsHashResolverFn,
  } = options;
  const [accounts, extension, loadingExtension, errExtension] = useInjectExtension(applicationDisplayName);
  const [isSignersLoading, setIsSignersLoading] = useState<boolean>(true);
  const [allAccounts, setAllAccounts] = useState<ReefSigner[]>();
  const jsonAccounts = { accounts, injectedSigner: extension?.signer };
  const selectedNetwork: Network|undefined = useObservableState(reefState.selectedNetwork$);
  const [selectedReefSigner, setSelectedReefSigner] = useState<ReefSigner>();
  const provider = useObservableState(reefState.selectedProvider$) as Provider|undefined;
  const [loading, setLoading] = useState(true);
  let selectedAddress:string|undefined = useObservableState(reefState.selectedAddress$);

  useEffect(() => {
    if (!accounts || !accounts.length || !extension) {
      return;
    }

    const network = getNetworkFallback();

    const jsonAccounts = { accounts, injectedSigner: extension?.signer };

    reefState.initReefState({
      network,
      jsonAccounts,
      ipfsHashResolverFn,
    });
  }, [accounts, extension, selectedNetwork]);

  const isProviderLoading = hooks.useObservableState(reefState.providerConnState$.pipe(map((v) => !(v as any).isConnected)), false);

  useEffect(() => {
    setLoading(loadingExtension || isProviderLoading || isSignersLoading);
  }, [isProviderLoading, loadingExtension, isSignersLoading]);

  const allReefAccounts = useObservableState(reefState.accounts$);

  useAsyncEffect(async () => {
    if (allReefAccounts && provider) {
      const extensionAccounts = [reefAccountToReefSigner(allReefAccounts, jsonAccounts.injectedSigner!)];
      const accountPromises = (extensionAccounts as any).flatMap(
        ({ accounts, name, sig }) => accounts.map((account) => rpc.accountToSigner(account, provider, sig, name)),
      );
      const allAccs = await Promise.all(accountPromises);
      setAllAccounts(allAccs);

      const storedAddress = getSelectedAddress();
      if (selectedAddress === undefined && storedAddress != undefined)selectedAddress = storedAddress;
      if (selectedAddress) {
        setSelectedReefSigner(allAccs.find((acc) => acc.address === selectedAddress));
        reefState.setSelectedAddress(selectedAddress);
      } else {
        setSelectedReefSigner(allAccs[0]);
        reefState.setSelectedAddress(allAccs[0].address);
      }
      setIsSignersLoading(false);
    }
  }, [allReefAccounts, provider, selectedAddress, network]);

  return {
    error: errExtension,
    loading,
    provider,
    network: selectedNetwork,
    signers: allAccounts,
    selectedReefSigner,
  };
};
