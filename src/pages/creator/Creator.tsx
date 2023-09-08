import React, { useContext } from 'react';
import {
  appState, hooks, Network, ReefSigner,
} from '@reef-defi/react-lib';
import { CreatorComponent } from './CreatorComponent';
import {reefState} from '@reef-chain/util-lib';
import ReefSigners from '../../context/ReefSigners';

export const Creator = (): JSX.Element => {
  const selectedSigner: ReefSigner|undefined|null =  useContext(ReefSigners).selectedSigner;
  const network: Network|undefined = hooks.useObservableState(reefState.selectedNetwork$);

  /* const onCreatorTxUpdate = (txState: utils.TxStatusUpdate): void => {
    const updateTypes = [UpdateDataType.ACCOUNT_NATIVE_BALANCE, UpdateDataType.ACCOUNT_TOKENS];
    const updateActions: UpdateAction[] = createUpdateActions(updateTypes, txState.addresses);
    onTxUpdateResetSigners(txState, updateActions);
  }; */

  return (
    <>
      {network && (
      <CreatorComponent
        signer={selectedSigner || undefined}
        network={network}
      />
      )}
    </>
  );
};
