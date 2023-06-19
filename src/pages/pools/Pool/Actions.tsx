import {
  appState,
  Components,
  graphql,
  hooks, store, Token,
} from '@reef-defi/react-lib';
import Uik from '@reef-chain/ui-kit';
import React, { useContext, useReducer, useState } from 'react';
import { useHistory } from 'react-router-dom';
import PoolContext from '../../../context/PoolContext';
import TokenContext from '../../../context/TokenContext';
import TokenPricesContext from '../../../context/TokenPricesContext';
import { POOL_CHART_URL } from '../../../urls';
import { MAX_SLIPPAGE, notify } from '../../../utils/utils';
import './actions.css';

const {
  Trade, Provide, Finalizing, Withdraw,
} = Components;

export type ActionTabs = 'stake' | 'unstake' | 'trade';

interface ActionsProps {
  token1: Token;
  token2: Token;
  tab: ActionTabs;
}

const Actions = ({ token1, token2, tab }: ActionsProps): JSX.Element => {
  const { tokens } = useContext(TokenContext);
  const tokenPrices = useContext(TokenPricesContext);
  const [finalized, setFinalized] = useState(true);
  const pools = useContext(PoolContext);

  const signer = hooks.useObservableState(
    appState.selectedSigner$,
  );
  const network = hooks.useObservableState(
    appState.currentNetwork$,
  );
  const apolloDex = hooks.useObservableState(
    graphql.apolloDexClientInstance$,
  );

  // Trade
  const [tradeState, tradeDispatch] = useReducer(
    store.swapReducer,
    store.initialSwapState,
  );

  hooks.useSwapState({
    address1: token1.address,
    address2: token2.address,
    dispatch: tradeDispatch,
    state: tradeState,
    tokenPrices,
    tokens,
    account: signer || undefined,
    dexClient: apolloDex,
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
    onFinalized: () => setFinalized(true),
  });
  const onSwitch = (): void => {
    tradeDispatch(store.switchTokensAction());
    tradeDispatch(store.setPercentageAction(0));
    tradeDispatch(store.clearTokenAmountsAction());
  };

  // Provide
  const [provideState, provideDispatch] = useReducer(
    store.addLiquidityReducer,
    store.initialAddLiquidityState,
  );

  hooks.useAddLiquidity({
    address1: token1.address,
    address2: token2.address,
    dispatch: provideDispatch,
    state: provideState,
    tokens,
    signer: signer || undefined,
    dexClient: apolloDex,
    tokenPrices,
  });

  const onAddLiquidity = hooks.onAddLiquidity({
    state: provideState,
    network,
    signer: signer || undefined,
    batchTxs: network?.name === 'mainnet',
    dispatch: provideDispatch,
    notify,
    updateTokenState: async () => {}, // eslint-disable-line
    onSuccess: () => setFinalized(false),
    onFinalized: () => setFinalized(true),
  });

  // Withdraw
  const [withdrawState, withdrawDispatch] = useReducer(
    store.removeLiquidityReducer,
    store.initialRemoveLiquidityState,
  );

  hooks.useRemoveLiquidity({
    tokens,
    dexClient: apolloDex,
    address1: token1.address,
    address2: token2.address,
    tokenPrices,
    state: withdrawState,
    signer: signer || undefined,
    dispatch: withdrawDispatch,
  });

  const onRemoveLiquidity = hooks.onRemoveLiquidity({
    network,
    state: withdrawState,
    signer: signer || undefined,
    batchTxs: network?.name === 'mainnet',
    notify,
    dispatch: withdrawDispatch,
    onSuccess: () => setFinalized(false),
    onFinalized: () => setFinalized(true),
  });

  if (!finalized) return <Finalizing />;

  // Add tokens not owned by user to the list
  const existingToken1 = tokens.find((token) => token.address === token1.address);
  if (!existingToken1) tokens.push(token1);

  const existingToken2 = tokens.find((token) => token.address === token2.address);
  if (!existingToken2) tokens.push(token2);

  // If finalized is false action will be 'false-void'
  const action = `${finalized}-${finalized ? tab : 'void'}`;
  switch (action) {
    case 'false-void':
      return <Finalizing />;
    case 'true-trade':
      // eslint-disable-next-line no-case-declarations
      return (
        <Trade
          pools={pools}
          tokens={tokens}
          state={tradeState}
          maxSlippage={MAX_SLIPPAGE}
          actions={{
            onSwap,
            onSwitch,
            setPercentage: (amount: number) => tradeDispatch(store.setPercentageAction(amount)),
            setToken1Amount: (amount: string): void => tradeDispatch(store.setToken1AmountAction(amount)),
            setToken2Amount: (amount: string): void => tradeDispatch(store.setToken2AmountAction(amount)),
            // selectToken1: (token: Token): void => tradeDispatch(store.setToken1Action(token)),
            // selectToken2: (token: Token): void => tradeDispatch(store.setToken2Action(token)),
            setSlippage: (slippage: number) => tradeDispatch(store.setSettingsAction({ ...tradeState.settings, percentage: (MAX_SLIPPAGE * slippage) / 100 })),
          }}
        />
      );
    case 'true-stake':
      return (
        <Provide
          state={provideState}
          tokens={tokens}
          actions={{
            onAddLiquidity,
            setPercentage: (amount: number) => provideDispatch(store.setPercentageAction(amount)),
            setToken1Amount: (amount: string) => provideDispatch(store.setToken1AmountAction(amount)),
            setToken2Amount: (amount: string) => provideDispatch(store.setToken2AmountAction(amount)),
          }}
        />
      );
    case 'true-unstake':
      return (
        <Withdraw
          state={withdrawState}
          actions={{
            onRemoveLiquidity,
            setPercentage: (percentage: number) => withdrawDispatch(store.setPercentageAction(percentage)),
          }}
        />
      );
    default:
      return <Finalizing />;
  }
};

interface ActionsWrapperProps extends ActionsProps {
  poolAddress: string;
}
const ActionsWrapper = ({
  token1, token2, poolAddress, tab,
}: ActionsWrapperProps): JSX.Element => {
  const history = useHistory();

  const selectTab = (newTab: ActionTabs): void => {
    history.push(
      POOL_CHART_URL
        .replace(':address', poolAddress)
        .replace(':action', newTab.toLowerCase()),
    );
  };

  return (
    <div className="uik-pool-actions pool-actions">
      <div className="uik-pool-actions__top">
        <Uik.Tabs
          value={tab}
          onChange={(value) => selectTab(value)}
          options={[
            { value: 'trade', text: 'Trade' },
            { value: 'stake', text: 'Stake' },
            { value: 'unstake', text: 'Unstake' },
          ]}
        />
      </div>
      <Actions
        token1={token1}
        token2={token2}
        tab={tab}
      />
    </div>
  );
};

export default ActionsWrapper;
