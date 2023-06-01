import { appState, hooks, ReefSigner } from '@reef-defi/react-lib';
import React, { useEffect, useState } from 'react';
import { Buffer } from 'buffer';
import { decodeAddress } from '@polkadot/util-crypto';
import { Provider, Signer } from '@reef-defi/evm-provider';
import { ethers } from 'ethers';
import Identicon from '@polkadot/react-identicon';
import Uik from '@reef-chain/ui-kit';

const MIN_BALANCE = ethers.utils.parseEther('5');
const hasBalanceForBinding = (balance: ethers.BigNumber): boolean => balance.gte(MIN_BALANCE);

const Account = ({ account }: { account: ReefSigner }): JSX.Element => (
  <div className="bind-evm-account">
    <div className="bind-evm-account__identicon">
      <Identicon value={account.address} size={44} theme="substrate" />
    </div>

    <div className="bind-evm-account__info">
      <div className="bind-evm-account__name">{ account.name }</div>
      <div className="bind-evm-account__address">{ toAddressShortDisplay(account.address) }</div>
    </div>
  </div>
);

interface BindStatus {
  inProgress: boolean;
  message?: string;
}

const trim = (value: string, size = 19): string =>
  value.length < size
    ? value
    : `${value.slice(0, size - 5)}...${value.slice(value.length - 5)}`;

const toAddressShortDisplay = (address: string): string =>
  trim(address, 7);

const queryEvmAddress = async (signer: Signer, provider: Provider): Promise<string> => {
  const address = await provider.api.query.evmAccounts.evmAddresses(
    signer._substrateAddress
  );
  return address.toString();
}

const BindCustom = (): JSX.Element => {
  const selectedSigner: ReefSigner | undefined | null = hooks.useObservableState(appState.selectedSigner$);
  const provider: Provider | undefined | null = hooks.useObservableState(appState.currentProvider$);
  const [bindFor, setBindFor] = useState<ReefSigner>();
  const [bindStatus, setBindStatus] = useState<BindStatus>({ inProgress: false});
  const [boundEvmAddress, setBoundEvmAddress] = useState<string>('');

  useEffect(() => {
    if (selectedSigner?.isEvmClaimed) {
      queryEvmAddress(selectedSigner.signer, provider).then((evmAddress) => {
        setBoundEvmAddress(evmAddress || selectedSigner.evmAddress);
      });
    }

    setBindFor(selectedSigner || undefined);
  }, [selectedSigner]);

  const bindEvmAddress = async (signer: Signer, provider: Provider): Promise<void> => {
    setBindStatus({ inProgress: true, message: 'Sign message with an EVM wallet (e.g. Metamask, Trust, Phantom...).' });

    const publicKey = decodeAddress(signer._substrateAddress);
    const message = 'reef evm:' + Buffer.from(publicKey).toString('hex');

    const { evmAddress, signature, error } = await signMessage(message);
    if (error) {
      setBindStatus({ inProgress: false, message: error });
      return;
    } else if (!evmAddress || !signature) {
      setBindStatus({ inProgress: false, message: 'Failed to sign message.' });
      return;
    }
    
    setBindStatus({ inProgress: true, message: `Send transaction with Reef extension to bind with ${evmAddress}.` });
    
    try {
      await provider.api.tx.evmAccounts.claimAccount(evmAddress,signature)
        .signAndSend(signer._substrateAddress);
      setBindStatus({ inProgress: true, message: `Binding to address ${evmAddress}.` });
    } catch (err) {
      console.error(err);
      setBindStatus({ inProgress: false, message: 'Failed to send transaction.' });
    }
  }
    
  const signMessage = async (message: string): Promise<{evmAddress?: string, signature?: string, error?: string}> => {
      // @ts-ignore
      const ethereumProvider = window.ethereum;
      if (typeof ethereumProvider === 'undefined') return { error: 'No EVM wallet found.' }

      try {
          const provider = new ethers.providers.Web3Provider(ethereumProvider);
          const accounts = await ethereumProvider.request({ method: 'eth_requestAccounts' })
            .catch((err: any) => {
              if (err.code === 4001) {
                return { error: 'Please connect to your EVM wallet.' };
              } else {
                console.error(err);
                return { error: 'Failed to connect to EVM wallet.' };
              }
            });
          const account = accounts[0];
          const signer = provider.getSigner();
          const signature = await signer.signMessage(message);
          return { evmAddress: account, signature };
      } catch (err) {
          console.error(err);
          return { error: "Failed to sign message" };
      }
  }

  return (
    <div className="mx-auto bind-evm">
      <> { provider && bindFor ? 
          <div>
            {/* Claimed */}
            { bindFor.isEvmClaimed && (
              <div>
                <Account account={bindFor} />
                <p>
                  {' '}
                  Successfully connected to Ethereum VM address&nbsp;
                  <b>{toAddressShortDisplay(boundEvmAddress)}</b>
                  .
                  <br />
                </p>
              </div>
            )}
            {/* Not claimed */}
            { !bindFor.isEvmClaimed && (
              <div>
                <p>
                  Start using Reef EVM smart contracts.
                  <br />
                  First connect EVM address for
                  {' '}
                </p>
                <Account account={bindFor} />
    
                { bindStatus.inProgress &&
                    <p className="bind-evm__loading">
                      <Uik.Loading size="small" />
                      <span>
                        { bindStatus.message }
                      </span>
                    </p>
                }
                { !bindStatus.inProgress && (<>
                  { !hasBalanceForBinding(bindFor.balance) &&
                    <p>Not enough REEF in account for connect EVM address transaction fee.</p>
                  }
                  { hasBalanceForBinding(bindFor.balance) && 
                    <div className='mb-4'>
                      <Uik.Button
                        fill
                        size="large"
                        text="Bind EVM address"
                        onClick={() => bindEvmAddress(bindFor.signer, provider)}
                      />
                    </div>
                  }
                  { bindStatus.message && 
                    <p>{ bindStatus.message }</p> 
                  }
                </>)}
              </div>
            )}
          </div>
          :
          <div>
            <p>No account found.</p>
          </div>
      } </>
    </div>
  );
};

export default BindCustom;