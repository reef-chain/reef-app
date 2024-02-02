import { Components } from '@reef-chain/react-lib';
import React from 'react';
import Uik from '@reef-chain/ui-kit';
import { faRepeat } from '@fortawesome/free-solid-svg-icons';
import { SwapPair } from './Activity';
import './activity-details.css';

import SwapDetails from './SwapDetails';

const { OverlayAction } = Components;

interface Props{
    isOpen:boolean;
    onClose:()=>void;
    swapPair:SwapPair;
}

function SwapActivityDetails({ isOpen, onClose, swapPair }:Props):JSX.Element {
  return (
    <OverlayAction isOpen={isOpen} onClose={onClose} className="overlay-swap" title={`Swap ${swapPair.pair}`}>
      <div className="transfer-asset__container">
        <div className="transfer-asset-summary">
          <div
            key={swapPair.token1.token.address}
            className={`
              transfer-asset
              transfer-asset--send
            `}
          >
            <div className="transfer-asset__content-ntf">
              <div className="transfer-asset__block">
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: '100%',
                }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexDirection: 'column',
                  }}
                  >
                    <div
                      className="transfer-asset__amount-token-icon row-span-2"
                      style={{ backgroundImage: `url(${swapPair.token1.token.iconUrl})` }}
                    />
                    <div style={{ padding: '4px' }}>
                      <Uik.Text type="mini" text={swapPair.token1.token.name} />
                    </div>

                  </div>
                  <div className="transfer-asset__indicator">
                    <Uik.Icon
                      icon={faRepeat}
                    />
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexDirection: 'column',
                  }}
                  >
                    <div
                      className="transfer-asset__amount-token-icon row-span-2"
                      style={{ backgroundImage: `url(${swapPair.token2.token.iconUrl})` }}
                    />
                    <div style={{ padding: '4px' }}>
                      <Uik.Text type="mini" text={swapPair.token2.token.name} />
                    </div>

                  </div>
                </div>
              </div>
              <Uik.Text text="Transfer Details" type="light" className="mt-2" />
              <div className="transfer-asset__block my-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SwapDetails token1={swapPair.token1} token2={swapPair.token2} fees={swapPair.fees} />

              </div>
              <Uik.Button text="Details" onClick={() => window.open(swapPair.token2.url, '_blank')} />
            </div>
          </div>
        </div>
      </div>
    </OverlayAction>
  );
}

export default SwapActivityDetails;
