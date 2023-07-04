import { NFT as NFTData } from '@reef-defi/react-lib';
import React, { useEffect, useState, useMemo } from 'react';
import './Nfts.css';
import Uik from '@reef-chain/ui-kit';
import NFT from './NFT';
import SqwidButton from './SqwidButton/SqwidButton';
import { localizedStrings } from '../../l10n/l10n';

export const Skeleton = (): JSX.Element => (
  <div className="nft-skeleton">
    <div className="nft-skeleton__image" />
    <div className="nft-skeleton__name" />
  </div>
);

interface NftsProps {
  nfts: NFTData[];
}

export const Nfts = ({ nfts }: NftsProps): JSX.Element => {
  const [indexKey, setIndexKey] = useState(0);
  const keyIndex = useMemo(() => indexKey, [indexKey]);

  useEffect(() => {
    // Do something when indexKey changes
  }, [indexKey]);

  return (
    <div className="nfts">
      {nfts.length === 0 && (
        <div className="nfts__empty">
          <Uik.Text type="light">{localizedStrings.does_not_hold}</Uik.Text>
          <SqwidButton />
        </div>
      )}
      {nfts.length > 0 && (
        <div className="col-12">
          {!!nfts.length && (
            <div className="nfts__container">
              {nfts.map((nft, index) => (
                <NFT
                  key={`${nft.address}-${nft.nftId}-${indexKey}`}
                  iconUrl={nft.iconUrl}
                  name={nft.name}
                  balance={nft.balance}
                  mimetype={nft.mimetype}
                  setKeyIndex={setIndexKey}
                  keyIndex={keyIndex}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
