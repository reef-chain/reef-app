import React, { useContext } from 'react';
import { CreatorComponent } from './CreatorComponent';
import ReefSigners from '../../context/ReefSigners';

export const Creator = (): JSX.Element => {
  const { selectedSigner, network } = useContext(ReefSigners);

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
