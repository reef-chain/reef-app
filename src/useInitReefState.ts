import {
    reefState,
  } from '@reef-chain/util-lib';
  import { useEffect, useState } from 'react';
  import { useInjectExtension } from './useInjectExtension';
  import { Provider } from '@reef-defi/evm-provider';
import { Network, ReefSigner} from '@reef-defi/react-lib';
import { useObservableState } from './hooks/useObservableState';
import { StateOptions } from '@reef-defi/react-lib/dist/appState/util';
import { State } from '@reef-defi/react-lib/dist/appState/util';
import type { Signer as InjectedSigner } from '@polkadot/api/types';
import { rpc } from '@reef-defi/react-lib/';
import { useAsyncEffect } from './useAsyncEffect';

const reefAccountToReefSigner = (accountsFromUtilLib:any,injectedSigner:InjectedSigner)=>{
  const resultObj = {
    name:'reef',
    sig:injectedSigner,
  };
  let reefSigners = <any[]>[];
  for(let i=0;i<accountsFromUtilLib.length;i++){
    let reefAccount = accountsFromUtilLib[i];
    let toReefSigner = {
      name:reefAccount.name,
      address:reefAccount.address,
      source:reefAccount.source,
      genesisHash:reefAccount.genesisHash,
    }
    reefSigners.push(toReefSigner);
  }
  resultObj['accounts'] = reefSigners;
  return resultObj;
}

interface UpdatedState extends State{
  selectedReefSigner?:ReefSigner
}

  export const useInitReefState = (
    applicationDisplayName: string,
    options: StateOptions = {},
  ): UpdatedState => {
    const {
      network, ipfsHashResolverFn,
    } = options;
    const [accounts, extension, loadingExtension, errExtension] = useInjectExtension(applicationDisplayName);
    const [isSignersLoading,setIsSignersLoading] = useState<boolean>(true);
    const [allAccounts,setAllAccounts] = useState<ReefSigner[]>();
    const jsonAccounts = { accounts, injectedSigner: extension?.signer };
    const selectedNetwork: Network|undefined = useObservableState(reefState.selectedNetwork$);
    const [selectedReefSigner,setSelectedReefSigner] = useState<ReefSigner>();
    const provider = useObservableState(reefState.selectedProvider$) as Provider|undefined;
    const [loading, setLoading] = useState(true);
    const selectedAddress:string|undefined = useObservableState(reefState.selectedAddress$);
  
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
      setLoading(loadingExtension||provider==undefined||isSignersLoading);
    }, [loadingExtension,provider,isSignersLoading]);

    const allReefAccounts = useObservableState(reefState.accounts$);
    useAsyncEffect(async()=>{
      if(allReefAccounts && provider){
        const extensionAccounts = [reefAccountToReefSigner(allReefAccounts,jsonAccounts.injectedSigner!)];
        const accountPromises = (extensionAccounts as any).flatMap(
          ({ accounts, name, sig }) => accounts.map((account) => rpc.accountToSigner(account, provider, sig, name)),
        );
        const allAccs = await Promise.all(accountPromises);
        setAllAccounts(allAccs);

        if(selectedAddress){
          setSelectedReefSigner(allAccs.find(acc => acc.address === selectedAddress))
          reefState.setSelectedAddress(selectedAddress);
        }else{
          setSelectedReefSigner(allAccs[0])
          reefState.setSelectedAddress(allAccs[0].address);
        }
        setIsSignersLoading(false);
      }
    },[allReefAccounts,provider,selectedAddress,network])
  
    return {
      error:errExtension,
      loading,
      provider,
      network: selectedNetwork,
      signers:allAccounts,
      selectedReefSigner,
    };
  };