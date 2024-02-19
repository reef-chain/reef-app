import React, { useContext, useEffect, useState } from 'react';
import Uik from '@reef-chain/ui-kit';
import {
  Components,
} from '@reef-chain/react-lib';
import Snap from './Snap';
import BrowserExtension from './BrowserExtension';
import SocialsWallet from './SocialsWallet';

const {
  Button: ButtonModule,
  Card: CardModule,
  Input: InputModule,
  Display, Icons,
} = Components;
const {
  ComponentCenter, MX, MT, FlexRow,
} = Display;
const {
  CardHeader, SubCard, CardHeaderBlank, CardTitle, Card,
} = CardModule;
const { InputAmount } = InputModule;
const { Button } = ButtonModule;

function Wallets() : JSX.Element {
  const tabs = (() => [
    { value: 'snap', text: 'MetaMask Snap' },
    { value: 'browser', text: 'Browser extension' },
    { value: 'socials', text: 'Socials wallet' },
  ])();

  const [tab, setTab] = useState<string>(tabs[0].value);
  
  return (
    <div className="dashboard">
      <div className="dashboard__main">
        <div className="dashboard__left">
          
          <Uik.Tabs
            className="dashboard__tabs "
            options={tabs}
            value={tab}
            onChange={(e) => setTab(e)}
          />

          {tab === 'snap' && <Snap />}
          {tab === 'browser' && <BrowserExtension />}
          {tab === 'socials' && <SocialsWallet />}
        </div>
      </div>
    </div>
  );
}

export default Wallets;
