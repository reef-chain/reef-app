import { appState, Components, hooks } from '@reef-defi/react-lib';
import React, { useState } from 'react';
import './overlay-swap.css';
import './overlay-nft.css';
import Uik from '@reef-chain/ui-kit';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { Contract } from 'ethers';
import BigNumber from 'bignumber.js';

const { OverlayAction } = Components;

export interface OverlaySendNFT {
  nftName?: string;
  isOpen: boolean;
  isVideoNFT?: boolean;
  iconUrl?: string;
  onClose: () => void;
  balance: string;
  address: string;
  contractType: string;
  nftId: string;
}

const nftTxAbi = [
  {
    "name": "safeTransferFrom",
    "type": "function",
    "inputs": [
      {
        "name": "from",
        "type": "address"
      },
      {
        "name": "to",
        "type": "address"
      },
      {
        "name": "id",
        "type": "uint256"
      },
      {
        "name": "amount",
        "type": "uint256"
      },
      {
        "name": "data",
        "type": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
]

const transferNFT = async (from: string, to: string, amount: number, nftContract: string, signer: any,nftId:number) => {
  const contractInstance = new Contract(nftContract, nftTxAbi, signer);
  contractInstance.safeTransferFrom(from, to, amount, nftId, [], {
    customData: {
      storageLimit: 2000
    }
  });
}

const OverlaySendNFT = ({
  nftName,
  isOpen,
  isVideoNFT,
  iconUrl,
  onClose,
  balance,
  address,
  contractType,
  nftId,
}: OverlaySendNFT): JSX.Element => {
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);

  const signer = hooks.useObservableState(appState.selectedSigner$);

  return (
    <OverlayAction
      isOpen={isOpen}
      title="NFT Details"
      onClose={onClose}
      className="overlay-swap"
    >
      <div className="uik-pool-actions pool-actions">
        <input type="text" onChange={e => setDestinationAddress(e.target.value)} />
        {destinationAddress}
        {amount}
        <input type="number" onChange={e => setAmount(1)} />
        <button onClick={() => transferNFT('0x7Ca7886e0b851e6458770BC1d85Feb6A5307b9a2','0x8Eb24026196108108E71E45F37591164BDefcB76',1,address,signer?.signer,1790)}>Send</button>
      </div>
    </OverlayAction>
  );
};

export default OverlaySendNFT;
