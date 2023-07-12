import { appState, Components, hooks } from '@reef-defi/react-lib';
import React, { useState } from 'react';
import './overlay-swap.css';
import './overlay-nft.css';
import Uik from '@reef-chain/ui-kit';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { Contract } from 'ethers';
import BigNumber from 'bignumber.js';
import {resolveEvmAddress,isSubstrateAddress} from "@reef-defi/evm-provider/utils"

const { OverlayAction } = Components;

export interface OverlaySendNFT {
  nftName?: string;
  isOpen: boolean;
  onClose: () => void;
  balance: string;
  address: string;
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

const transferNFT = async (from: string, to: string, amount: number, nftContract: string, signer: any,provider:any,nftId:string) => {
  const contractInstance = new Contract(nftContract, nftTxAbi, signer);
  const toAddress = await getResolvedEVMAddress(provider,to);
  contractInstance.safeTransferFrom(from, toAddress, nftId, amount, [], {
    customData: {
      storageLimit: 2000
    }
  });
}

const getResolvedEVMAddress=async(provider:any,address:string):Promise<string>=>{
  if(isSubstrateAddress(address)){
    const resolvedEvmAddress = await resolveEvmAddress(provider,address);
    return resolvedEvmAddress; 
  }
  return address;
}


const OverlaySendNFT = ({
  nftName,
  isOpen,
  onClose,
  balance,
  address,
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
        <Uik.Input label='Send to :' type="text" onChange={e => setDestinationAddress(e.target.value)} />
       <br />
        <Uik.Input label='Amount : ' value={amount.toString()} type="number" onChange={e => setAmount(e.target.value)} />
        <br />
        <Uik.Button onClick={() => transferNFT(signer?.evmAddress!,destinationAddress,amount,address,signer?.signer,provider,nftId)} fill>Send</Uik.Button>
      </div>
    </OverlayAction>
  );
};

export default OverlaySendNFT;
