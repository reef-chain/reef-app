import {  Components, hooks, ReefSigner } from '@reef-defi/react-lib';
import React, { useContext } from 'react';
import TokenContext from '../context/TokenContext';
import { notify } from '../utils/utils';
import './overlay-swap.css';
import {reefState} from '@reef-chain/util-lib';
import {Provider} from "@reef-defi/evm-provider";
import ReefSigners from '../context/ReefSigners';

const { Send, OverlayAction } = Components;

export interface OverlaySend {
  tokenAddress?: string;
  isOpen: boolean;
  onClose?: () => void;
}

const OverlaySend = ({
  tokenAddress,
  isOpen,
  onClose,
}: OverlaySend): JSX.Element => {
  const { tokens } = useContext(TokenContext);

  const signer: ReefSigner|undefined|null =  useContext(ReefSigners).selectedSigner;
  const accounts: ReefSigner[]|undefined|null = useContext(ReefSigners).accounts;
  const provider:Provider = hooks.useObservableState(reefState.selectedProvider$);

  return (
    <OverlayAction
      isOpen={isOpen}
      title="Send"
      onClose={onClose}
      className="overlay-swap"
    >
      <div className="uik-pool-actions pool-actions">
        { provider && signer
          && (
          <Send
            accounts={accounts || []}
            notify={notify}
            provider={provider}
            signer={signer}
            tokens={tokens}
            tokenAddress={tokenAddress}
          />
          )}
      </div>
    </OverlayAction>
  );
};

export default OverlaySend;
