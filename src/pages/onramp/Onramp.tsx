import { ReefSigner } from '@reef-chain/react-lib';
import React, { useContext } from 'react';
import ReefSigners from '../../context/ReefSigners';

function Onramp() : JSX.Element {
  const signer: ReefSigner|undefined|null = useContext(ReefSigners).selectedSigner;
  return (
    <div style={{ height: '100vh' }}>
      <iframe
        title="onramp-display"
        src={`https://onramp.money/main/buy/?appId=487411&walletAddress=${signer?.address}`}
        style={{ width: '100%', height: '100%', border: 'none' }}
      />

    </div>
  );
}

export default Onramp;
