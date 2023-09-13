import {
  appState,
  Components,
  hooks,
  ReefSigner,
} from '@reef-defi/react-lib';
import Identicon from '@polkadot/react-identicon';
import React, { useEffect, useMemo, useState } from 'react';
import './overlay-swap.css';
import './overlay-nft.css';
import Uik from '@reef-chain/ui-kit';
import { Contract, ethers } from 'ethers';
import { resolveEvmAddress, isSubstrateAddress } from '@reef-defi/evm-provider/utils';
import { Provider, Signer } from '@reef-defi/evm-provider';
import { shortAddress } from '../utils/utils';

const { OverlayAction } = Components;

export interface OverlaySendNFT {
  nftName?: string;
  isOpen: boolean;
  onClose: () => void;
  balance: string;
  address: string;
  nftId: string;
  iconUrl?: string;
  isVideoNFT?:boolean;
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

const Accounts = ({
  accounts,
  selectAccount,
  isOpen,
  onClose,
  query,
  selectedAccount,
}: {
  accounts: ReefSigner[];
  selectAccount: (index: number, signer: ReefSigner) => void;
  isOpen: boolean;
  onClose: () => void;
  query: string;
  selectedAccount: ReefSigner;
}): JSX.Element => {
  const availableAccounts = useMemo(() => {
    const list = accounts.filter(({ address }) => selectedAccount.address !== address);

    if (!query) return list;

    const perfectMatch = list.find((acc) => acc.address === query);
    if (perfectMatch) {
      return [
        perfectMatch,
        ...list.filter((acc) => acc.address !== query),
      ];
    }

    return list.filter((acc) => acc.address.toLowerCase().startsWith(query.toLowerCase())
        || (acc.name as any).replaceAll(' ', '').toLowerCase().startsWith(query.toLowerCase()));
  }, [accounts, query]);

  return (
    <div className="send-accounts">
      {
        availableAccounts?.length > 0
          && (
            <Uik.Dropdown
              isOpen={isOpen}
              onClose={onClose}
            >
              {
                availableAccounts.map((account, index) => (
                  <Uik.DropdownItem
                    key={`account-${index}`}
                    className={`
                      send-accounts__account
                      ${account.address === query ? 'send-accounts__account--selected' : ''}
                    `}
                    onClick={() => selectAccount(index, account)}
                  >
                    <Identicon className="send-accounts__account-identicon" value={account.address} size={44} theme="substrate" />
                    <div className="send-accounts__account-info">
                      <div className="send-accounts__account-name">{ account.name }</div>
                      <div className="send-accounts__account-address">{ shortAddress(account.address) }</div>
                    </div>
                  </Uik.DropdownItem>
                ))
              }
            </Uik.Dropdown>
          )
      }
    </div>
  );
};

const OverlaySendNFT = ({
  nftName,
  isOpen,
  onClose,
  balance,
  isVideoNFT,
  iconUrl,
  address,
  nftId,
}: OverlaySendNFT): JSX.Element => {
  const [isAccountListOpen, setAccountsListOpen] = useState(false);
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [btnLabel, setBtnLabel] = useState<string>('Enter destination address');
  const accounts = hooks.useObservableState(appState.accountsSubj);
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
        <div className='send__address'>
        <Identicon className="send__address-identicon" value={destinationAddress} size={46} theme="substrate" />
        <input
          className="send__address-input"
          value={destinationAddress}
          maxLength={70}
          onChange={(e) => setDestinationAddress(e.target.value)}
          placeholder={`Send ${nftName} to:`}
          disabled={transactionInProgress}
          onFocus={() => setAccountsListOpen(true)}
        />
        {
          accounts && accounts!.length > 0
          && (
            <Accounts
              isOpen={isAccountListOpen}
              onClose={() => setAccountsListOpen(false)}
              accounts={accounts!}
              query={destinationAddress}
              selectAccount={(_, signer) => setDestinationAddress(signer.address)}
              selectedAccount={signer!}
            />
     
          )
        }
        </div>   
        <div className='send__address'>
          {isVideoNFT?
           <video
           className={`nfts__item-video-small nft-iconurl-small send__address-identicon`}
           autoPlay
           loop
           muted
           poster=""
         >
           <source src={iconUrl} type="video/mp4" />
         </video>
          :<img
          src={iconUrl}
          alt=""
          className={`nft-iconurl-small send__address-identicon`}
       
        />}
         <input
         type="number"
          className="send__amount-input"
          value={amount.toString()}
          maxLength={70}
          name="amount"
          onChange={(e) => setAmount(+e.target.value)}
          placeholder={`Send ${amount} ${nftName}`}
          disabled={!isAmountEnabled || transactionInProgress}
        />
        </div> 
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
