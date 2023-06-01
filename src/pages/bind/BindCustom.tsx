import {
  appState, Components, hooks, ReefSigner,
} from '@reef-defi/react-lib';
import React, { useEffect, useState } from 'react';
import { TxStatusUpdate } from '@reef-defi/react-lib/dist/utils';
import { Provider } from '@reef-defi/evm-provider';
import { Buffer } from 'buffer';
import { claimEvmAccount, unbindEvmAccount } from './Signer';

// @ts-ignore
window.Buffer = Buffer;

const { EvmBindComponent } = Components;

const onTxUpdate = (state: TxStatusUpdate): void => {
  let updateActions: appState.UpdateAction[] = [];

  if (state.componentTxType === Components.EvmBindComponentTxType.BIND) {
    // bind
    if (state.addresses && state.addresses.length) {
      state.addresses.forEach((address) => {
        updateActions.push({
          address,
          type: appState.UpdateDataType.ACCOUNT_EVM_BINDING,
        } as appState.UpdateAction);
        updateActions.push({
          address,
          type: appState.UpdateDataType.ACCOUNT_NATIVE_BALANCE,
        } as appState.UpdateAction);
      });
    } else {
      updateActions = [{ type: appState.UpdateDataType.ACCOUNT_EVM_BINDING }, { type: appState.UpdateDataType.ACCOUNT_NATIVE_BALANCE }];
    }
  } else {
    // transaction
    updateActions = state.addresses && state.addresses.length
      ? state.addresses.map((address) => ({
        address,
        type: appState.UpdateDataType.ACCOUNT_NATIVE_BALANCE,
      } as appState.UpdateAction))
      : [{ type: appState.UpdateDataType.ACCOUNT_NATIVE_BALANCE }];
  }

  appState.onTxUpdateResetSigners(state, updateActions);
};

const BindCustom = (): JSX.Element => {
  const accounts: ReefSigner[] | undefined | null = hooks.useObservableState(appState.signers$);
  const selectedSigner: ReefSigner | undefined | null = hooks.useObservableState(appState.selectedSigner$);
  const provider_: Provider | undefined | null = hooks.useObservableState(appState.currentProvider$);
  const [bindSigner, setBindSigner] = useState<ReefSigner>();
  const [provider, setProvider] = useState<Provider | undefined>();

  useEffect(() => {
    setBindSigner(selectedSigner || undefined);
  }, [accounts, selectedSigner]);

  useEffect(() => {
    setProvider(provider_ || undefined);
  }, [provider_]);


  if (!bindSigner || !accounts) {
    return <div>No account</div>;
  }

  return (<div><button onClick={() => bindEvmAddress(bindSigner, provider!)}>Bind</button></div>);
};

export default BindCustom;


export const bindEvmAddress = async (
  signer: ReefSigner,
  provider: Provider
) => {
  if (!provider || !signer) {
    alert('No provider or signer');
    return;
  }

  try {
    // if (signer.isEvmClaimed) {
    //   await unbindEvmAccount(signer.signer, provider);
    // } else {
      await claimEvmAccount(signer.signer, provider);
    // }
  } catch (err: any) {
    alert(err);
    return;
  }
};