import {
  appState, Components, ReefSigner,
} from '@reef-chain/react-lib';
import React, { useContext, useEffect, useState } from 'react';
import { TxStatusUpdate } from '@reef-chain/react-lib/dist/utils';
import ReefSigners from '../../context/ReefSigners';

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
  } else if (state.componentTxType === Components.EvmBindComponentTxType.TRANSFER) {
    // transaction
    updateActions = state.addresses && state.addresses.length
      ? state.addresses.map((address) => ({
        address,
        type: appState.UpdateDataType.ACCOUNT_NATIVE_BALANCE,
      } as appState.UpdateAction))
      : [{ type: appState.UpdateDataType.ACCOUNT_NATIVE_BALANCE }];
  } else {
    // sign evm message
    return;
  }

  appState.onTxUpdateResetSigners(state, updateActions);
};

const Bind = (): JSX.Element => {
  const { selectedSigner } = useContext(ReefSigners);
  const { accounts } = useContext(ReefSigners);
  const [bindSigner, setBindSigner] = useState<ReefSigner>();

  useEffect(() => {
    const [, params] = window.location.href.split('?');
    // TODO WTF!? Rewrite all
    const urlParams = params?.split('&').map((e) => e.split('=').map(decodeURIComponent)).reduce((r: any, [k, v]) => { // eslint-disable-line
      r[k] = v;// eslint-disable-line

      return r;
    }, {});
    const { bindAddress } = urlParams || {};
    let paramAccount;

    if (bindAddress) {
      paramAccount = accounts?.find((acc) => acc.address === bindAddress);
    }

    setBindSigner(paramAccount || selectedSigner || undefined);
  }, [accounts, selectedSigner]);

  if (!bindSigner || !accounts) {
    return <div />;
  }

  return (
    <EvmBindComponent
      bindSigner={bindSigner}
      onTxUpdate={onTxUpdate}
      signers={accounts}
    />
  );
};

export default Bind;
