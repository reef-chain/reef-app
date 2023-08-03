import { ReefSigner, appState, hooks } from '@reef-defi/react-lib';
import React from 'react';

function Onramp() : JSX.Element {
  const signer: ReefSigner|undefined|null = hooks.useObservableState(appState.selectedSigner$);
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
