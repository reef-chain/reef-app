import { appState, Components, hooks } from '@reef-defi/react-lib';
import React, { useState } from 'react';
import './overlay-swap.css';
import './overlay-nft.css';
import Uik from '@reef-chain/ui-kit';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { Contract ,ethers} from 'ethers';
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
  const [btnLabel, setBtnLabel] = useState<string>('Enter destination address');

  const signer = hooks.useObservableState(appState.selectedSigner$);
  const provider = hooks.useObservableState(appState.currentProvider$);

  const clearStates = ()=>{
    setDestinationAddress('');
    setAmount(0);
    onClose();
  }

  const transferNFT = async (from: string, to: string, amount: number, nftContract: string, signer: any,provider:any,nftId:string) => {
    const contractInstance = new Contract(nftContract, nftTxAbi, signer);
    const toAddress = await getResolvedEVMAddress(provider,to);
    try {   
      const result = await contractInstance.safeTransferFrom(from, toAddress, nftId, amount, [], {
        customData: {
          storageLimit: 2000
        }
      });
      Uik.notify.success('Transaction Successful!');
      clearStates();
    } catch (error:any) {
      if(error.message == '_canceled'){
        Uik.notify.danger('Cancelled by user');
      }else{
        Uik.notify.danger('Some error occured');
      }
    }
  }

  const validator = (e:any)=>{
    if(e.target.name == "amount"){
      setAmount(e.target.value);
      if(e.target.value>parseInt(balance)){
        setBtnLabel('Amount too high');
      }else if(e.target.value<1){
        setBtnLabel('Amount too low');
      }else{
        if(ethers.utils.isAddress(destinationAddress)){
          setBtnLabel('Send');
        }
      }
    }
  if(e.target.name=="destination"){
    setDestinationAddress(e.target.value);
      if(ethers.utils.isAddress(e.target.value) && (amount<=parseInt(balance) && amount>0)){
        setBtnLabel('Send')
      }else if(ethers.utils.isAddress(e.target.value) && (amount>parseInt(balance) && amount<=0)){
        setBtnLabel('Amount not valid')
      }else {
        setBtnLabel('Address is invalid')
      }
  }
}

  return (
    <OverlayAction
      isOpen={isOpen}
      title="NFT Details"
      onClose={onClose}
      className="overlay-swap"
    >
      <div className="uik-pool-actions pool-actions">
        <Uik.Input label={`Send ${nftName} to :`} name='destination' type="text" onChange={e => {
          validator(e);
        }} />
       <br />
        <Uik.Input label='Amount : ' name='amount' value={amount.toString()} type="number" onChange={e => {
          validator(e);
        }
          }/>
        <br />
        {btnLabel == "Send"?<Uik.Button onClick={() => transferNFT(signer?.evmAddress!,destinationAddress,amount,address,signer?.signer,provider,nftId)} fill>{btnLabel}</Uik.Button>:<Uik.Button onClick={() => transferNFT(signer?.evmAddress!,destinationAddress,amount,address,signer?.signer,provider,nftId)} disabled>{btnLabel}</Uik.Button>}
        
      </div>
    </OverlayAction>
  );
};

export default OverlaySendNFT;
