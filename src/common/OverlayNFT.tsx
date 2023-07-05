import { appState, Components, hooks } from '@reef-defi/react-lib';
import React, { useContext,useState } from 'react';
import TokenContext from '../context/TokenContext';
import './overlay-swap.css';
import './overlay-nft.css';

const { Send, OverlayAction } = Components;

export interface OverlayNFT {
  nftName?: string;
  isOpen: boolean;
  isVideoNFT?: boolean;
  iconUrl?: string;
  onClose:any;
  balance:any;
  address:string;
  contractType:string;
  nftId:string;
}

const OverlayNFT = ({
  nftName,
  isOpen,
  isVideoNFT,
  iconUrl,
  onClose,
  balance,
  address,
  contractType,
  nftId
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
        <div className='nft-name--modal'>{nftName}</div>
        <div className='nft-view'>
          {isVideoNFT ? (
            <video className="nfts__item-video nft-iconurl" autoPlay loop muted poster="">
              <source src={iconUrl} type="video/mp4" />
            </video>
          ) : (
                <img src={iconUrl} alt="" className='nft-iconurl' />
          )}
        </div>
        <div className='display-table'>
          <div>
       <span className='display-table-label'>
       nft id : 
        </span> {nftId}
          </div>
            <div >
              <span className='display-table-label'>
              balance : 
              </span>
             {balance.toString()}
            </div>
            <div>
           <span className='display-table-label'>
           address : 
            </span> {address}
            </div>
            <div>
            <span className='display-table-label'>
            contract type : 
            </span>
             {contractType}
            </div>
        </div>
      </div>
    </OverlayAction>
  );
};

export default OverlayNFT;
