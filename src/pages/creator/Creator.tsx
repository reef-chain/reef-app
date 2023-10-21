import React, { useContext } from 'react';
import {
  hooks, Network,
} from '@reef-chain/react-lib';
import { reefState } from '@reef-chain/util-lib';
import { CreatorComponent } from './CreatorComponent';
import ReefSigners from '../../context/ReefSigners';

export const Creator = (): JSX.Element => {
  const { selectedSigner } = useContext(ReefSigners);
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
