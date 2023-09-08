import {
    reefState,
  } from '@reef-chain/util-lib';
  import { useEffect, useState } from 'react';
  import { useInjectExtension } from './useInjectExtension';
  import { Provider } from '@reef-defi/evm-provider';
import { Network} from '@reef-defi/react-lib';
import { useObservableState } from './hooks/useObservableState';
import { StateOptions } from '@reef-defi/react-lib/dist/appState/util';
import { State } from '@reef-defi/react-lib/dist/appState/util';
  
  export const useInitReefState = (
    applicationDisplayName: string,
    options: StateOptions = {},
  ): State => {
    const {
      network, ipfsHashResolverFn,
    } = options;
    const [accounts, extension, loadingExtension, errExtension] = useInjectExtension(applicationDisplayName);
    const selectedNetwork: Network|undefined = useObservableState(reefState.selectedNetwork$);
    const provider = useObservableState(reefState.selectedProvider$) as Provider|undefined;
    const [loading, setLoading] = useState(true);
    const selectedAddress:string|undefined = useObservableState(reefState.selectedAddress$);

    useEffect(()=>{
      if (!accounts || !accounts.length || !extension) {
        return;
      }
      if(selectedAddress!=accounts[0].address){
        reefState.setSelectedAddress(accounts[0].address);
      }
    },[accounts,selectedAddress])
  
    useEffect(() => {
  
      if (!accounts || !accounts.length || !extension) {
        return;
      }
  
      const jsonAccounts = { accounts, injectedSigner: extension?.signer };
        reefState.initReefState({
          network,
          jsonAccounts,
          ipfsHashResolverFn,
        });
    }, [accounts, extension]);


  
    useEffect(() => {
      setLoading(loadingExtension||provider==undefined);
    }, [loadingExtension,provider]);
  
    return {
      error:errExtension,
      loading,
      provider,
      network: selectedNetwork,
    };
  };