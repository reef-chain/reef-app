import { appState, Components, hooks } from '@reef-defi/react-lib';
import React, { useState } from 'react';
import './overlay-swap.css';
import './overlay-nft.css';
import Uik from '@reef-chain/ui-kit';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { Contract } from 'ethers';
import BigNumber from 'bignumber.js';
import {resolveEvmAddress} from "@reef-defi/evm-provider/utils"

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

const transferNFT = async (from: string, to: string, amount: number, nftContract: string, signer: any,nftId:string) => {
  const contractInstance = new Contract(nftContract, nftTxAbi, signer);
  contractInstance.safeTransferFrom(from, to, amount, 1720, [], {
    customData: {
      storageLimit: 2000
    }
  });
}

const getResolvedEVMAddress=async(provider:any,address:string):Promise<string>=>{
  const result = await resolveEvmAddress(provider,address);
  return result; 
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
  const provider = hooks.useObservableState(appState.currentProvider$);

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
        <button onClick={() => transferNFT(signer?.evmAddress!,'0x8Eb24026196108108E71E45F37591164BDefcB76',1,address,signer?.signer,nftId)}>Send</button>
        <button onClick={()=>getResolvedEVMAddress(provider,'5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP')}>
    resolve evm addr
          </button>
      </div>
    </OverlayAction>
  );
};

export default OverlaySendNFT;
