import { ReefSigner, appState,hooks } from '@reef-defi/react-lib';
import React from 'react';

function Onramp() {
const signer: ReefSigner|undefined|null = hooks.useObservableState(appState.selectedSigner$);
  return (
    <div style={{height:'100vh'}}>
      <iframe
        src={`https://onramp.money/main/buy/?appId=487411&walletAddress=${signer?.address}`}
        style={{ width: '100%', height: '100%', border: 'none' }}
      ></iframe>
     
    </div>
  );
}

export default Onramp;
