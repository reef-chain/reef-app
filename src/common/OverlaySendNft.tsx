import {
  appState,
  Components,
  hooks,
} from '@reef-defi/react-lib';
import React, { useEffect, useState } from 'react';
import './overlay-swap.css';
import './overlay-nft.css';
import Uik from '@reef-chain/ui-kit';
import { Contract, ethers } from 'ethers';
import { resolveEvmAddress, isSubstrateAddress } from '@reef-defi/evm-provider/utils';
import { Provider, Signer } from '@reef-defi/evm-provider';

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
    name: 'safeTransferFrom',
    type: 'function',
    inputs: [
      {
        name: 'from',
        type: 'address',
      },
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'id',
        type: 'uint256',
      },
      {
        name: 'amount',
        type: 'uint256',
      },
      {
        name: 'data',
        type: 'bytes',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
];

const getResolvedEVMAddress = (provider:Provider, address:string): Promise<string> => {
  if (isSubstrateAddress(address)) {
    return resolveEvmAddress(provider, address);
  }
  return Promise.resolve(address);
};

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
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isAmountEnabled, setIsAmountEnabled] = useState<boolean>(false);
  const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);

  const signer = hooks.useObservableState(appState.selectedSigner$);
  const provider = hooks.useObservableState(appState.currentProvider$);

  const clearStates = ():void => {
    setDestinationAddress('');
    setAmount(0);
    setIsFormValid(false);
    setIsAmountEnabled(false);
    setTransactionInProgress(false);
  };

  const transferNFT = async (from: string, to: string, _amount: number, nftContract: string, _signer: Signer, _provider: Provider, _nftId: string): Promise<void> => {
    if (!isFormValid || transactionInProgress) {
      return;
    }

    setTransactionInProgress(true);
    const contractInstance = new Contract(nftContract, nftTxAbi, _signer);
    const toAddress = await getResolvedEVMAddress(_provider, to);
    try {
      await contractInstance.safeTransferFrom(from, toAddress, _nftId, _amount, [], {
        customData: {
          storageLimit: 2000,
        },
      });
      Uik.notify.success('Transaction Successful!');
      clearStates();
      onClose();
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      if (!toAddress) {
        Uik.notify.danger('Transaction can not be made because destination address does not have EVM address connected.');
      } else if (error?.message === '_canceled') {
        Uik.notify.danger('Transaction cancelled by user');
      } else {
        Uik.notify.danger('Unknown error occurred, please try again');
      }
    } finally {
      setTransactionInProgress(false);
    }
  };

  useEffect(() => {
    const parsedBalance = parseInt(balance, 10);
    setAmount(parsedBalance);
    setIsAmountEnabled(parsedBalance > 1);
  }, [balance]);

  useEffect(() => {
    const validateAmount = (): boolean => {
      if (amount > parseInt(balance, 10)) {
        setBtnLabel('Amount too high');
      } else if (amount < 1) {
        setBtnLabel('Amount too low');
      } else {
        setBtnLabel('Send');
      }
      return amount > 0 && amount <= parseInt(balance, 10);
    };

    const validateDestinationAddress = (): boolean => {
      const isAddressValid = ethers.utils.isAddress(destinationAddress) || isSubstrateAddress(destinationAddress);
      if (!isAddressValid) {
        setBtnLabel('Address is invalid');
      } else {
        setBtnLabel('Send');
      }
      return isAddressValid;
    };

    const amountValid = validateAmount();
    const destinationValid = validateDestinationAddress();
    setIsFormValid(amountValid && destinationValid);
  }, [amount, balance, destinationAddress]);

  return (
    <OverlayAction
      isOpen={isOpen}
      title="Send NFT"
      onClose={onClose}
      className="overlay-swap"
    >
      <div className="uik-pool-actions pool-actions">
        <Uik.Input
          label={`Send ${nftName} to:`}
          placeholder="Enter destination address"
          name="destination"
          type="text"
          disabled={transactionInProgress}
          onChange={(e) => setDestinationAddress(e.target.value)}
        />
        <br />
        <Uik.Input
          label="Amount: "
          name="amount"
          value={amount.toString()}
          type="number"
          disabled={!isAmountEnabled || transactionInProgress}
          onChange={(e) => setAmount(+e.target.value)}
        />
        <br />
        <Uik.Button
          disabled={!isFormValid}
          loading={transactionInProgress}
          fill={isFormValid && !transactionInProgress}
          onClick={() => transferNFT(signer?.evmAddress as string, destinationAddress, amount, address, signer?.signer as Signer, provider, nftId)}
        >
          { !transactionInProgress ? btnLabel : ''}
        </Uik.Button>

      </div>
    </OverlayAction>
  );
};

export default OverlaySendNFT;
