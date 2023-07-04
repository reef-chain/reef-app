import React, { useState, useEffect } from 'react';
import { BigNumber } from 'ethers';
import OverlaySend from '../../common/OverlaySend';
import OverlayNFT from '../../common/OverlayNFT';

interface NFTData {
  iconUrl: string;
  name: string;
  balance: BigNumber;
  mimetype?: string;
  setKeyIndex: any;
  keyIndex: any;
}

const NFT = ({
  iconUrl, name, balance, mimetype, setKeyIndex, keyIndex
}: NFTData): JSX.Element => {
  const loading = false;
  const [isNftDetailsOpen, setIsNFTDetailsOpen] = useState(false);
  const [nftKey, setNftKey] = useState(0);

  useEffect(() => {
    // Reset the key when isNftDetailsOpen is set to false
    if (!isNftDetailsOpen) {
      setNftKey(nftKey + 1);
    }
  }, [isNftDetailsOpen]);

  return (
    <div className="nfts__item" onClick={() => {
      setIsNFTDetailsOpen(true);
    }}>
      {mimetype && mimetype.indexOf('mp4') > -1
        && (
          <video className="nfts__item-video" autoPlay loop muted poster="">
            <source src={iconUrl} type="video/mp4" />
          </video>
        )}
      {(!mimetype || !(mimetype?.indexOf('mp4') > -1)) && (
        <div
          className={`
            nfts__item-image
            ${loading ? 'nfts__item-image--loading' : ''}
          `}
          style={
            iconUrl && !loading
              ? { backgroundImage: `url(${iconUrl})` } : {}
          }
        />
      )}
      <div className="nfts__item-info">
        <div className="nfts__item-name">{name}</div>
        <div className="nfts__item-balance">{balance.toString()}</div>
      </div>
      <OverlayNFT
        key={nftKey}
        nftName={name}
        isVideoNFT={mimetype != undefined && mimetype.indexOf('mp4') > -1}
        iconUrl={iconUrl}
        isOpen={isNftDetailsOpen}
        onClose={setKeyIndex}
        onCloseIdx={keyIndex}
      />
    </div>
  );
};

export default NFT;
