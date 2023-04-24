import {
  appState, Components, hooks, store, Token,
} from '@reef-defi/react-lib';
import React, { useContext, useReducer, useState } from 'react';
import { BigNumber } from 'ethers';
import PoolContext from '../context/PoolContext';
import TokenContext from '../context/TokenContext';
import TokenPricesContext from '../context/TokenPricesContext';
import { notify } from '../utils/utils';
import './overlay-swap.css';

const { Trade, OverlayAction, Finalizing } = Components;

export interface OverlaySwap {
  isOpen: boolean;
  tokenAddress: string;
  onClose?: () => void;
}

const OverlaySwap = ({
  tokenAddress,
  isOpen,
  onClose,
}: OverlaySwap): JSX.Element => {
  const [address1, setAddress1] = useState(tokenAddress);
  const [address2, setAddress2] = useState('0x');
  const { tokens } = useContext(TokenContext);
  const tokenPrices = useContext(TokenPricesContext);
  const [finalized, setFinalized] = useState(true);
  const pools = useContext(PoolContext);

  const network = hooks.useObservableState(appState.currentNetwork$);
  const signer = hooks.useObservableState(appState.selectedSigner$);

  // Trade
  const [tradeState, tradeDispatch] = useReducer(
    store.swapReducer,
    store.initialSwapState,
  );

  // Add tokens not owned by user to the list of tokens
  const tokenPools = pools.filter((pool) => pool.token1 === tokenAddress || pool.token2 === tokenAddress);
  tokenPools.forEach((pool) => {
    const otherToken: Token = pool.token1 === tokenAddress
      ? {
        address: pool.token2,
        decimals: pool.decimal2,
        name: pool.name2,
        symbol: pool.symbol2,
        iconUrl: pool.icon2,
        balance: BigNumber.from(0),
      } : {
        address: pool.token1,
        decimals: pool.decimal1,
        name: pool.name1,
        symbol: pool.symbol1,
        iconUrl: pool.icon1,
        balance: BigNumber.from(0),
      };
    const existingToken = tokens.find((token) => token.address === otherToken.address);
    if (!existingToken) tokens.push(otherToken);
  });

  hooks.useSwapState({
    address1,
    address2,
    dispatch: tradeDispatch,
    state: tradeState,
    tokenPrices,
    tokens,
    account: signer || undefined,
    network,
  });

  const onSwap = hooks.onSwap({
    state: tradeState,
    network,
    account: signer || undefined,
    batchTxs: network?.name === 'mainnet',
    dispatch: tradeDispatch,
    notify,
    updateTokenState: async () => {}, // eslint-disable-line
    onSuccess: () => setFinalized(false),
    onFinalized: () => {
      setFinalized(true);
      if (onClose) onClose();
    },
  });
  const onSwitch = (): void => {
    tradeDispatch(store.switchTokensAction());
    tradeDispatch(store.setPercentageAction(0));
    tradeDispatch(store.clearTokenAmountsAction());
  };

  return (
    <OverlayAction
      isOpen={isOpen}
      title="Swap"
      onClose={onClose}
      className="overlay-swap"
    >
      <div className="uik-pool-actions pool-actions">
        {
          finalized
            ? (
              <Trade
                pools={pools}
                tokens={tokens}
                state={tradeState}
                actions={{
                  onSwap,
                  onSwitch,
                  selectToken1: (token: Token): void => setAddress1(token.address),
                  selectToken2: (token: Token): void => setAddress2(token.address),
                  setPercentage: (amount: number) => tradeDispatch(store.setPercentageAction(amount)),
                  setToken1Amount: (amount: string): void => tradeDispatch(store.setToken1AmountAction(amount)),
                  setToken2Amount: (amount: string): void => tradeDispatch(store.setToken2AmountAction(amount)),
                  setSlippage: (slippage: number) => tradeDispatch(store.setSettingsAction({ ...tradeState.settings, percentage: slippage })),
                }}
              />
            )
            : <Finalizing />
        }
      </div>
    </OverlayAction>
  );
};

export default OverlaySwap;
