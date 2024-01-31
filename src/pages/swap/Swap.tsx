import {
  Components, hooks, Settings, store, Token,
} from '@reef-chain/react-lib';
import React, { useContext, useReducer } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import { DexProtocolv2 } from '@reef-chain/util-lib/dist/network';
import TokenContext from '../../context/TokenContext';
import TokenPricesContext from '../../context/TokenPricesContext';
import { addressReplacer, SPECIFIED_SWAP_URL, UrlAddressParams } from '../../urls';
import { notify } from '../../utils/utils';
import ReefSigners from '../../context/ReefSigners';
import { useDexConfig } from '../../environment';

const { SwapComponent } = Components;

const Swap = (): JSX.Element => {
  const history = useHistory();
  const { tokens } = useContext(TokenContext);
  const tokenPrices = useContext(TokenPricesContext);
  const { address1, address2 } = useParams<UrlAddressParams>();

  const { selectedSigner: signer, network: nw } = useContext(ReefSigners);

  const network:DexProtocolv2|undefined = useDexConfig(nw);

  const [state, dispatch] = useReducer(store.swapReducer, store.initialSwapState);
  // hook manages all necessary swap updates
  hooks.useSwapState({
    address1,
    address2,
    dispatch,
    httpClient: axios,
    state,
    tokens,
    tokenPrices,
    account: signer || undefined,
  });

  // Actions
  const onSwap = hooks.onSwap({
    state,
    network,
    account: signer || undefined,
    batchTxs: nw?.name === 'mainnet',
    dispatch,
    notify,
    onSuccess: () => {
      // do nothing
    },
    updateTokenState: async () => {}, // eslint-disable-line
  });
  const onSwitch = (): void => {
    dispatch(store.switchTokensAction());
    dispatch(store.clearTokenAmountsAction());
    history.push(addressReplacer(SPECIFIED_SWAP_URL, state.token2.address, state.token1.address));
  };
  const selectToken1 = (token: Token): void => {
    dispatch(store.setToken1Action(token));
    dispatch(store.clearTokenAmountsAction());
    history.push(addressReplacer(SPECIFIED_SWAP_URL, token.address, state.token2.address));
  };
  const selectToken2 = (token: Token): void => {
    dispatch(store.setToken2Action(token));
    dispatch(store.clearTokenAmountsAction());
    history.push(addressReplacer(SPECIFIED_SWAP_URL, state.token1.address, token.address));
  };
  const setSettings = (settings: Settings): void => dispatch(store.setSettingsAction(settings));
  const setToken1Amount = (amount: string): void => dispatch(store.setToken1AmountAction(amount));
  const setToken2Amount = (amount: string): void => dispatch(store.setToken2AmountAction(amount));

  const actions: store.SwapComponentActions = {
    onAddressChange: async () => {}, // eslint-disable-line
    setPercentage: () => {}, // eslint-disable-line
    onSwap,
    onSwitch,
    selectToken1,
    selectToken2,
    setSettings,
    setToken1Amount,
    setToken2Amount,
  };

  if (!signer) {
    return <div />;
  }
  return (
    <SwapComponent
      tokens={tokens}
      account={signer}
      state={state}
      actions={actions}
    />
  );
};

export default Swap;
