import {
  Components,
  hooks,
} from '@reef-defi/react-lib';
import React, { useContext } from 'react';
import { Provider } from '@reef-defi/evm-provider';
import { reefState } from '@reef-chain/util-lib';
import TokenContext from '../../context/TokenContext';
import { notify } from '../../utils/utils';
import ReefSigners from '../../context/ReefSigners';

const { Send } = Components;

export const Transfer = (): JSX.Element => {
  const provider: Provider|undefined = hooks.useObservableState(reefState.selectedProvider$);
  const { selectedSigner } = useContext(ReefSigners);
  const { accounts } = useContext(ReefSigners);
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
