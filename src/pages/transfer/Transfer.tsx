import { Components } from '@reef-chain/react-lib';
import React, { useContext } from 'react';
import TokenContext from '../../context/TokenContext';
import { notify } from '../../utils/utils';
import ReefSigners from '../../context/ReefSigners';

const { Send } = Components;

export const Transfer = (): JSX.Element => {
  const { selectedSigner, provider, accounts } = useContext(ReefSigners);
  const { tokens } = useContext(TokenContext);

  if (!accounts || !selectedSigner || !provider) {
    return <div />;
  }

  return (
    <Send
      notify={notify}
      accounts={accounts}
      provider={provider}
      signer={selectedSigner}
      tokens={tokens.filter(({ balance }) => balance.gt(0))}
    />
  );
};
