import {
  Components, hooks, store, Token,
} from '@reef-chain/react-lib';
import React, { useContext, useReducer } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import type { Network } from '../../state/networkDex';
import { useNetworkDex } from '../../state/networkDex';
import TokenContext from '../../context/TokenContext';
import TokenPricesContext from '../../context/TokenPricesContext';
import { ADD_LIQUIDITY_URL, addressReplacer } from '../../urls';
import { notify } from '../../utils/utils';
import ReefSigners from '../../context/ReefSigners';

const { AddLiquidity } = Components;
interface UrlParams {
  address1: string;
  address2: string;
}

const AddPoolLiquidity = (): JSX.Element => {
  const { address1, address2 } = useParams<UrlParams>();
  const history = useHistory();
  const { tokens } = useContext(TokenContext);
  const tokenPrices = useContext(TokenPricesContext);
  const { selectedSigner: signer, network: nw } = useContext(ReefSigners);
  const network: Network | undefined = useNetworkDex(nw);

  const [state, dispatch] = useReducer(store.addLiquidityReducer, store.initialAddLiquidityState);
  hooks.useAddLiquidity({
    address1,
    address2,
    dispatch,
    state,
    tokens,
    signer: signer || undefined,
    httpClient: axios,
    tokenPrices,
  });

  const selectToken1 = (token: Token): void => {
    dispatch(store.setToken1Action(token));
    history.push(addressReplacer(ADD_LIQUIDITY_URL, token.address, address2));
  };
  const selectToken2 = (token: Token): void => {
    dispatch(store.setToken2Action(token));
    history.push(addressReplacer(ADD_LIQUIDITY_URL, address1, token.address));
  };
  const onAddLiquidity = hooks.onAddLiquidity({
    state,
    network,
    signer: signer || undefined,
    batchTxs: network?.name === 'mainnet',
    dispatch,
    notify,
    updateTokenState: async () => {}, // eslint-disable-line
  });
  if (!signer) {
    return <div />;
  }
  return (
    <AddLiquidity
      signer={signer}
      state={state}
      tokens={tokens}
      actions={{
        selectToken1,
        selectToken2,
        onAddLiquidity,
        back: history.goBack,
        setPercentage: async () => {}, // eslint-disable-line
        onAddressChange: async () => {}, // eslint-disable-line
        setSettings: (settings) => dispatch(store.setSettingsAction(settings)),
        setToken1Amount: (amount) => dispatch(store.setToken1AmountAction(amount)),
        setToken2Amount: (amount) => dispatch(store.setToken2AmountAction(amount)),
      }}
    />
  );
};

export default AddPoolLiquidity;
