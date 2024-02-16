import {
  Components, hooks, store, Token,
} from '@reef-chain/react-lib';
import React, { useContext, useReducer } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import axios, { AxiosInstance } from 'axios';
import { network as libNet } from '@reef-chain/util-lib';
import TokenContext from '../../context/TokenContext';
import TokenPricesContext from '../../context/TokenPricesContext';
import { ADD_LIQUIDITY_URL, addressReplacer } from '../../urls';
import { notify } from '../../utils/utils';
import ReefSigners from '../../context/ReefSigners';
import { useDexConfig } from '../../environment';

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
  const network:libNet.DexProtocolv2|undefined = useDexConfig(nw);
  const httpClient: AxiosInstance = axios;

  const [state, dispatch] = useReducer(store.addLiquidityReducer, store.initialAddLiquidityState);
  hooks.useAddLiquidity({
    address1,
    address2,
    dispatch,
    state,
    tokens,
    signer: signer || undefined,
    httpClient,
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
    batchTxs: nw?.name === 'mainnet',
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
