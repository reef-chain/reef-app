import React, { useContext } from 'react';

import {
  Components,
} from '@reef-chain/react-lib';

import { MetaMaskContext, MetamaskActions } from '../../context/MetamaskContext';
import { connectSnap, getSnap, isLocalSnap } from '../../utils/snap';
import "./snap.css";
import Uik from '@reef-chain/ui-kit';

const {
  Button: ButtonModule,
  Card: CardModule,
  Display,
} = Components;
const {
  MT,
  ComponentCenter
} = Display;
const {
  CardHeader, CardHeaderBlank, CardTitle, Card,
} = CardModule;
const { Button } = ButtonModule;

function Snap() : JSX.Element {
  const [state, dispatch] = useContext(MetaMaskContext);

  const isMetaMaskReady = isLocalSnap()
    ? state.isFlask
    : state.snapsDetected;

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
        <Uik.Text type="headline" className="snap-page__title">MetaMask Snap</Uik.Text>

        <Card>
          <CardHeader>
            <CardHeaderBlank />
            <CardTitle title="What are MetaMask Snaps?" />
            <CardHeaderBlank />
          </CardHeader>
          <div>
            MetaMask Snaps is an open source system that allows anyone to safely extend the functionality of MetaMask. <br/>
            <a href="https://docs.metamask.io/snaps" target='_blank'>Learn more</a>
          </div>
        </Card>
        <MT size="3" />

        <Card>
          <CardHeader>
            <CardHeaderBlank />
            <CardTitle title="Why Reef Snap?" />
            <CardHeaderBlank />
          </CardHeader>
          <div>
            Reef Snap allows MetaMask users to interact with the Reef Chain without the need to install a separate wallet.
          </div>
        </Card>
        <MT size="3" />

        <Card>
          <CardHeader>
            <CardHeaderBlank />
            <CardTitle title="How to start using it?" />
            <CardHeaderBlank />
          </CardHeader>
          <div>
            1. Install MetaMask <br/>
            2. Add Reef Snap to your MetaMask <br/>
            3. Connect to app.reef.io <br/>
            4. Select "MetaMask Snap" in the wallet selector <br/>
          </div>
        </Card>
        <MT size="4" />

        <div className='snap-action'>
          {!isMetaMaskReady && (
            <>
              {isLocalSnap() ? (
                <Button onClick={() => window.open('https://metamask.io/flask', '_blank')}>
                  <Components.Logos.MetaMaskLogo className='button-icon'/>
                  Install MetaMask Flask
                </Button>
              ) : (
                <Button onClick={() => window.open('https://metamask.io/', '_blank')}>
                  <Components.Logos.MetaMaskLogo className='button-icon'/>
                  Install MetaMask
                </Button>
              )}
            </>
          )}
          {isMetaMaskReady && !state.installedSnap && (
            <Button onClick={connect} disabled={!isMetaMaskReady}>Connect to Reef Snap</Button>
          )}
        </div>
    </ComponentCenter>
  );
}

export default Snap;
