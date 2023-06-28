import {
  AddressToNumber, appState, graphql, hooks, TokenWithAmount,
} from '@reef-defi/react-lib';
import React, { useEffect, useMemo, useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import NftContext from '../context/NftContext';
import PoolContext from '../context/PoolContext';
import TokenContext from '../context/TokenContext';
import TokenPrices from '../context/TokenPricesContext';
import {
  ADD_LIQUIDITY_URL,
  BIND_URL,
  BONDS_URL,
  CREATE_ERC20_TOKEN_URL,
  DASHBOARD_URL,
  POOL_CHART_URL,
  POOLS_URL,
  REMOVE_LIQUIDITY_URL,
  SPECIFIED_SWAP_URL,
  TRANSFER_TOKEN,
  BUY_URL,
  ONRAMP_URL
} from '../urls';
import Bind from './bind/Bind';
import { Bonds } from './bonds/Bonds';
import { Creator } from './creator/Creator';
import Dashboard from './dashboard/Dashboard';
import AddPoolLiquidity from './pools/AddLiquidity';
import Pool from './pools/Pool/Pool';
import Pools from './pools/Pools';
import RemoveLiquidity from './pools/RemoveLiquidity';
import Swap from './swap/Swap';
import Buy from './buy/Buy';
import { Transfer } from './transfer/Transfer';
import { isAddressWhitelisted, isReefswapUI } from '../environment';
import { shortAddress } from '../utils/utils';
import Onramp from './onramp/Onramp';

const ContentRouter = (): JSX.Element => {
  const selectedAddress = hooks.useObservableState(appState.currentAddress$);
  const selectedNetwork = hooks.useObservableState(appState.currentNetwork$);
  const [isDisplayWhitelisted, setDisplayWhitelisted] = useState(false);

  useEffect(() => {
    setDisplayWhitelisted(isAddressWhitelisted(selectedAddress, selectedNetwork));
  }, [selectedAddress, selectedNetwork]);

  // const currentSigner: ReefSigner|undefined|null = hooks.useObservableState(appState.selectedSigner$);
  // const reefPrice = hooks.useObservableState(appState.reefPrice$);
  // const [tokenPrices, setTokenPrices] = useState({} as AddressToNumber<number>);
  // Its not appropriate to have token state in this component, but the problem was apollo client.
  // Once its declared properly in App move TokenContext in the parent component (App.tsx)

  const tokens = hooks.useObservableState<TokenWithAmount[]|null>(appState.tokenPrices$, []);
  const [nfts, nftsLoading] = hooks.useAllNfts();
  const apolloDex = hooks.useObservableState(graphql.apolloDexClientInstance$);
  const pools = hooks.useAllPools(apolloDex);
  const tokenPrices = useMemo(
    () => (tokens ? tokens.reduce((prices: AddressToNumber<number>, tkn) => {
      prices[tkn.address] = tkn.price;// eslint-disable-line
      return prices;
    }, {}) : []),
    [tokens],
  );
  /*
const tokenPrices = useMemo(
    () => hooks.estimatePrice(tokens||[], pools, reefPrice || 0),
    [tokens, pools, reefPrice],
  );
*/

  return (
    <div className="content">
      {isDisplayWhitelisted
      && (
      <TokenContext.Provider value={{ tokens: tokens || [], loading: tokens == null }}>
        <NftContext.Provider value={{ nfts, loading: nftsLoading }}>
          <PoolContext.Provider value={pools}>
            <TokenPrices.Provider value={tokenPrices as AddressToNumber<number>}>
              {!isReefswapUI && (
              <Switch>
                <Route path={SPECIFIED_SWAP_URL} component={Swap} />
                {/* <Route exact path={POOLS_URL} component={Pools} /> */}
                <Route exact path={DASHBOARD_URL} component={Dashboard} />
                {/* <Route path={ADD_LIQUIDITY_URL} component={AddPoolLiquidity} /> */}
                {/* <Route exact path={ADD_LIQUIDITY_URL} component={AddPoolLiquidity} /> */}
                {/* <Route path={POOL_CHART_URL} component={Pool} /> */}
                {/* <Route path={REMOVE_LIQUIDITY_URL} component={RemoveLiquidity} /> */}
                <Route exact path={TRANSFER_TOKEN} component={Transfer} />
                <Route exact path={CREATE_ERC20_TOKEN_URL} component={Creator} />
                <Route exact path={BONDS_URL} component={Bonds} />
                <Route path={BIND_URL} component={Bind} />
                <Route path={BUY_URL} component={Buy} />
                <Route path={ONRAMP_URL} component={Onramp} />
                <Route path="/" render={() => (<Redirect to={DASHBOARD_URL} />)} />
              </Switch>
              )}

              {isReefswapUI && (
              <Switch>
                <Route path={SPECIFIED_SWAP_URL} component={Swap} />
                <Route exact path={POOLS_URL} component={Pools} />
                <Route exact path={DASHBOARD_URL} component={Dashboard} />
                <Route path={ADD_LIQUIDITY_URL} component={AddPoolLiquidity} />
                <Route exact path={ADD_LIQUIDITY_URL} component={AddPoolLiquidity} />
                <Route path={POOL_CHART_URL} component={Pool} />
                <Route path={REMOVE_LIQUIDITY_URL} component={RemoveLiquidity} />
                <Route exact path={TRANSFER_TOKEN} component={Transfer} />
                <Route exact path={CREATE_ERC20_TOKEN_URL} component={Creator} />
                <Route exact path={BONDS_URL} component={Bonds} />
                <Route path={BIND_URL} component={Bind} />
                <Route path={BUY_URL} component={Buy} />
                <Route path={ONRAMP_URL} component={Onramp} />
                <Route path="/" render={() => (<Redirect to={DASHBOARD_URL} />)} />
              </Switch>
              )}
            </TokenPrices.Provider>
          </PoolContext.Provider>
        </NftContext.Provider>
      </TokenContext.Provider>
      )}
      {!isDisplayWhitelisted && (
      <div>
        <div className="uik-alert
        uik-alert--danger"
        >
          <div className="uik-alert__content">
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="fas"
              data-icon="triangle-exclamation"
              className="svg-inline--fa fa-triangle-exclamation uik-icon uik-alert__icon"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <path
                fill="currentColor"
                d="M506.3 417l-213.3-364c-16.33-28-57.54-28-73.98 0l-213.2 364C-10.59 444.9 9.849 480 42.74 480h426.6C502.1 480 522.6 445 506.3 417zM232 168c0-13.25 10.75-24 24-24S280 154.8 280 168v128c0 13.25-10.75 24-23.1 24S232 309.3 232 296V168zM256 416c-17.36 0-31.44-14.08-31.44-31.44c0-17.36 14.07-31.44 31.44-31.44s31.44 14.08 31.44 31.44C287.4 401.9 273.4 416 256 416z"
              />
            </svg>
            <div className="uik-alert__text">
              Selected address
              {' '}
              {selectedAddress ? shortAddress(selectedAddress) : ''}
              {' '}
              is not whitelisted for ReefSwap testing. Select another whitelisted address or wait until the end of testing period.
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default ContentRouter;
