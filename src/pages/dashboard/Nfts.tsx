import React, { useContext, useState } from 'react';
import { NFT as NFTData,Components } from '@reef-chain/react-lib';
import './Nfts.css';
import Uik from '@reef-chain/ui-kit';
import SqwidButton from './SqwidButton/SqwidButton';
import { localizedStrings } from '../../l10n/l10n';
import ReefSigners from '../../context/ReefSigners';

const {NFTCard,OverlayNFT} = Components;

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
  const { accounts, selectedSigner, provider } = useContext(ReefSigners);
  const [selectedNFT, setSelectedNFT] = useState<NFTData | undefined>(undefined);

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
              {nfts.map((nft) => (
                <div
                  className="nft__button"
                  key={`${nft.address}-${nft.nftId}`}
                  role="button"
                  onClick={() => setSelectedNFT(nft)}
                >
                  <NFTCard
                    iconUrl={nft.iconUrl}
                    name={nft.name}
                    balance={nft.balance}
                    mimetype={nft.mimetype}
                  />
                  
                </div>
              ))}

              {!!selectedNFT && (
                <OverlayNFT
                  isOpen={!!selectedNFT}
                  onClose={() => setSelectedNFT(undefined)}
                  nftName={selectedNFT.name}
                  isVideoNFT={selectedNFT.mimetype !== undefined && selectedNFT.mimetype?.includes('mp4')}
                  iconUrl={selectedNFT.iconUrl}
                  balance={selectedNFT.balance.toString()}
                  address={selectedNFT.address}
                  contractType={selectedNFT.contractType}
                  nftId={selectedNFT.nftId}
                  accounts={accounts}
                  selectedSigner={selectedSigner}
                  provider={provider}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
