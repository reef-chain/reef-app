import { appState, Components, hooks } from '@reef-defi/react-lib';
import React, { useContext,useState } from 'react';
import TokenContext from '../context/TokenContext';
import { notify } from '../utils/utils';
import './overlay-swap.css';

const { Send, OverlayAction } = Components;

export interface OverlayNFT {
  nftName?: string;
  isOpen: boolean;
  isVideoNFT?: boolean;
  iconUrl?: string;
  onClose:any;
}

const OverlayNFT = ({
  nftName,
  isOpen,
  isVideoNFT,
  iconUrl,
  onClose
}: OverlayNFT): JSX.Element => {
  const { tokens } = useContext(TokenContext);

  const signer = hooks.useObservableState(appState.selectedSigner$);
  const accounts = hooks.useObservableState(appState.accountsSubj);
  const provider = hooks.useObservableState(appState.currentProvider$);

  return (
    <OverlayAction
      isOpen={isOpen}
      title="NFT Details"
      onClose={onClose}
      className="overlay-swap"
    >
      <div className="uik-pool-actions pool-actions">
        <div>{nftName}</div>
        <div>
          {isVideoNFT ? (
            <video className="nfts__item-video" autoPlay loop muted poster="">
              <source src={iconUrl} type="video/mp4" />
            </video>
          ) : (
            <img src={iconUrl} alt="" />
          )}
        </div>
      </div>
    </OverlayAction>
  );
};

export default OverlayNFT;
