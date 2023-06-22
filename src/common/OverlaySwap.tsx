import {
  appState, Components, graphql, hooks, Pool, PoolWithReserves, store, Token,
} from '@reef-defi/react-lib';
import React, {
  useContext, useEffect, useReducer, useState,
} from 'react';
import { BigNumber } from 'ethers';
import PoolContext from '../context/PoolContext';
import TokenContext from '../context/TokenContext';
import TokenPricesContext from '../context/TokenPricesContext';
import { MAX_SLIPPAGE, notify } from '../utils/utils';
import './overlay-swap.css';

const { Trade, OverlayAction, Finalizing } = Components;
const REEF_ADDRESS = '0x0000000000000000000000000000000001000000';

export interface OverlaySwap {
    isOpen: boolean;
    tokenAddress: string;
    onPoolsLoaded: (hasPools: boolean) => void;
    onClose?: () => void;
}

const poolWithReservesToPool = (pool: PoolWithReserves): Pool => ({
  token1: {
    address: pool.token1,
    decimals: pool.decimals1,
    name: pool.name1,
    symbol: pool.symbol1,
    iconUrl: pool.iconUrl1,
    balance: BigNumber.from(0),
  },
  token2: {
    address: pool.token2,
    decimals: pool.decimals2,
    name: pool.name2,
    symbol: pool.symbol2,
    iconUrl: pool.iconUrl2,
    balance: BigNumber.from(0),
  },
  decimals: 0,
  reserve1: pool.reserved1,
  reserve2: pool.reserved2,
  totalSupply: '0',
  poolAddress: pool.address,
  userPoolBalance: '0',
});

const OverlaySwap = ({
  tokenAddress,
  isOpen,
  onPoolsLoaded,
  onClose,
}: OverlaySwap): JSX.Element => {
  const [address1, setAddress1] = useState(tokenAddress);
  const [address2, setAddress2] = useState('0x');
  const [pool, setPool] = useState<Pool | undefined>(undefined);
  const [finalized, setFinalized] = useState(true);
  const { tokens } = useContext(TokenContext);
  const tokenPrices = useContext(TokenPricesContext);
  const pools = useContext(PoolContext);

  const network = hooks.useObservableState(appState.currentNetwork$);
  const signer = hooks.useObservableState(appState.selectedSigner$);
  const apolloDex = hooks.useObservableState(graphql.apolloDexClientInstance$);

  // Trade
  const [tradeState, tradeDispatch] = useReducer(
    store.swapReducer,
    store.initialSwapState,
  );

  useEffect(() => {
    if (!pools || !tokenAddress || !tokens) return;

    // Add tokens not owned by user to the list of tokens and check if REEF is available for swapping
    const tokenPools = pools.filter((pool) => pool.token1 === tokenAddress || pool.token2 === tokenAddress);
    if (!tokenPools.length) return;

    let reefAvailable = false;
    tokenPools.forEach((pool) => {
      const otherToken: Token = pool.token1 === tokenAddress
        ? {
          address: pool.token2,
          decimals: pool.decimals2,
          name: pool.name2,
          symbol: pool.symbol2,
          iconUrl: pool.iconUrl2,
          balance: BigNumber.from(0),
        } : {
          address: pool.token1,
          decimals: pool.decimals1,
          name: pool.name1,
          symbol: pool.symbol1,
          iconUrl: pool.iconUrl1,
          balance: BigNumber.from(0),
        };
      const existingToken = tokens.find((token) => token.address === otherToken.address);
      if (!existingToken) tokens.push(otherToken);
      if (!reefAvailable && otherToken.address === REEF_ADDRESS) reefAvailable = true;
    });

    let addr2 = REEF_ADDRESS;
    if (!reefAvailable) {
      addr2 = tokenPools[0].token1 === tokenAddress ? tokenPools[0].token2 : tokenPools[0].token1;
    }
    // Set default buy token
    setAddress2(addr2);

    // Find pool
    const t1 = tokenAddress < addr2 ? tokenAddress : addr2;
    const t2 = tokenAddress < addr2 ? addr2 : tokenAddress;
    const p = pools.find((pool) => pool.token1 === t1 && pool.token2 === t2);
    if (p) {
      onPoolsLoaded(true);
      setPool(poolWithReservesToPool(p));
    } else {
      onPoolsLoaded(false);
      console.error('Pool not found');
    }
  }, [pools, tokenAddress, tokens]);

  hooks.useSwapState({
    address1,
    address2,
    dispatch: tradeDispatch,
    state: tradeState,
    tokenPrices,
    tokens,
    account: signer || undefined,
    dexClient: apolloDex,
    waitForPool: true,
    pool,
  });

  const onSwap = hooks.onSwap({
    state: tradeState,
    network,
    account: signer || undefined,
    batchTxs: network?.name === 'mainnet',
    dispatch: tradeDispatch,
    notify,
    updateTokenState: async () => Promise.resolve(), // eslint-disable-line
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
                maxSlippage={MAX_SLIPPAGE}
                actions={{
                  onSwap,
                  onSwitch,
                  selectToken1: (token: Token): void => setAddress1(token.address),
                  selectToken2: (token: Token): void => setAddress2(token.address),
                  setPercentage: (amount: number) => tradeDispatch(store.setPercentageAction(amount)),
                  setToken1Amount: (amount: string): void => tradeDispatch(store.setToken1AmountAction(amount)),
                  setToken2Amount: (amount: string): void => tradeDispatch(store.setToken2AmountAction(amount)),
                  setSlippage: (slippage: number) => tradeDispatch(store.setSettingsAction({
                    ...tradeState.settings,
                    percentage: (MAX_SLIPPAGE * slippage) / 100
                  })),
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
