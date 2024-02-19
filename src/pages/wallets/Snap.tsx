import React, { useContext, useState } from 'react';

import {
  Components,
} from '@reef-chain/react-lib';

import { MetaMaskContext, MetamaskActions } from '../../context/MetamaskContext';
import { connectSnap, getSnap, isLocalSnap, snapId } from '../../utils/snap';

const {
  Button: ButtonModule,
  Card: CardModule,
  Input: InputModule,
  Display, Icons,
} = Components;
const {
  ComponentCenter
} = Display;
const {
  CardHeader, SubCard, CardHeaderBlank, CardTitle, Card,
} = CardModule;
const { Button } = ButtonModule;

function Snap() : JSX.Element {
  const [state, dispatch] = useContext(MetaMaskContext);

  const isMetaMaskReady = isLocalSnap(snapId)
    ? state.isFlask
    : state.snapsDetected;

  const installMetamask = () => {
    window.open('https://metamask.io/', '_blank');
  };

  const connect = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (error) {
      console.error(error);
      dispatch({ type: MetamaskActions.SetError, payload: error });
    }
  };
  
  return (
    <ComponentCenter>
        {!isMetaMaskReady && (
            <Card>
                <Button onClick={installMetamask}>Install MetaMask</Button>
            </Card>
        )}
        {isMetaMaskReady && !state.installedSnap && (
            <Card>
                <Button onClick={connect} disabled={!isMetaMaskReady}>Connect</Button>
            </Card>
        )}
        {state.installedSnap && (
            <Card>
                <div>Snap installed</div>
            </Card>
        )}
    </ComponentCenter>
  );
}

export default Snap;
