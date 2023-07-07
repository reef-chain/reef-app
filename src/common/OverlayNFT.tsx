import { Components } from '@reef-defi/react-lib';
import React, { useState } from 'react';
import './overlay-swap.css';
import './overlay-nft.css';
import Uik from '@reef-chain/ui-kit';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import OverlaySendNFT from './OverlaySendNft';

const { OverlayAction } = Components;

export interface OverlayNFT {
  nftName?: string;
  isOpen: boolean;
  isVideoNFT?: boolean;
  iconUrl?: string;
  onClose:()=>void;
  balance:string;
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
  nftId,
}: OverlayNFT): JSX.Element =>{
  const[sendNFT,setSendNFT]=useState(false);
// const { tokens } = useContext(TokenContext);

  // const signer = hooks.useObservableState(appState.selectedSigner$);
  // const accounts = hooks.useObservableState(appState.accountsSubj);
  // const provider = hooks.useObservableState(appState.currentProvider$);
  return (<OverlayAction
    isOpen={isOpen}
    title="NFT Details"
    onClose={onClose}
    className="overlay-swap"
  >
    <div className="uik-pool-actions pool-actions">
      <div className="nft-name--modal">{nftName}</div>
      <div className="nft-view">
        {isVideoNFT ? (
          <video className="nfts__item-video nft-iconurl" autoPlay loop muted poster="">
            <source src={iconUrl} type="video/mp4" />
          </video>
        ) : (
          <img src={iconUrl} alt="" className="nft-iconurl" />
        )}
      </div>
      <div className="display-table">
        <div>
          <span className="display-table-label">nft id : </span>
          {' '}
          {nftId}
        </div>
        <div>
          <span className="display-table-label">balance : </span>
          {balance}
        </div>
        <div>
          <span className="display-table-label">address : </span>
          {' '}
          {address}
        </div>
        <div>
          <span className="display-table-label">contract type : </span>
          {' '}
          {contractType}
        </div>
      </div>
      <div className="nft-box-send-btn">
        <Uik.Button
          text="Send NFT"
          icon={faPaperPlane}
          onClick={() => {
            setSendNFT(true);
          }}
          size="large"
          fill
        />
      </div>
    </div>
    <OverlaySendNFT
                isOpen={sendNFT}
                onClose={() => setSendNFT(false)}
                nftName={nftName}
                isVideoNFT={false}
                iconUrl={'nfts[nftIndex].iconUrl'}
                balance={'nfts[nftIndex].balance.toString()'}
                address={'nfts[nftIndex].address'}
                contractType={'nfts[nftIndex].contractType'}
                nftId={'nfts[nftIndex].nftId'}
              />
  </OverlayAction>
)};
export default OverlayNFT;