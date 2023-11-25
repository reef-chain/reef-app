import { Components } from '@reef-chain/react-lib';
import React, { useContext } from 'react';
import TokenContext from '../context/TokenContext';
import { notify } from '../utils/utils';
import './overlay-swap.css';
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

  const { selectedSigner, provider } = useContext(ReefSigners);
  const { accounts } = useContext(ReefSigners);

  return (
    <OverlayAction
      isOpen={isOpen}
      title="Send"
      onClose={onClose}
      className="overlay-swap"
    >
      <div className="uik-pool-actions pool-actions">
        { provider && selectedSigner
          && (
          <Send
            accounts={accounts || []}
            notify={notify}
            provider={provider}
            signer={selectedSigner}
            tokens={tokens}
            tokenAddress={tokenAddress}
          />
          )}
      </div>
    </OverlayAction>
  );
};

export default OverlaySend;
