import { AddressToNumber, hooks, TokenWithAmount } from '@reef-chain/react-lib';
import React, { useContext, useMemo } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import axios from 'axios';
import NftContext from '../context/NftContext';
import PoolContext from '../context/PoolContext';
import TokenContext from '../context/TokenContext';
import TokenPrices from '../context/TokenPricesContext';
import {
  ADD_LIQUIDITY_URL,
  BIND_URL,
  BONDS_URL,
  BUY_URL,
  CREATE_ERC20_TOKEN_URL,
  DASHBOARD_URL,
  ONRAMP_URL,
  POOL_CHART_URL,
  POOLS_URL,
  REMOVE_LIQUIDITY_URL,
  SNAP_URL,
  SPECIFIED_SWAP_URL,
  TRANSFER_TOKEN,
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
import Transfer  from './transfer/Transfer';
import { isReefswapUI } from '../environment';
import Onramp from './onramp/Onramp';
import ReefSigners from '../context/ReefSigners';
import Snap from './snap/Snap';

const ContentRouter = (): JSX.Element => {
  const { reefState, selectedSigner } = useContext(ReefSigners);

  // const [tokenPrices, setTokenPrices] = useState({} as AddressToNumber<number>);
  // Its not appropriate to have token state in this component, but the problem was apollo client.
  // Once its declared properly in App move TokenContext in the parent component (App.tsx)

  const tokens = hooks.useObservableState<TokenWithAmount[]|null>(reefState.selectedTokenPrices$, []);

  const [nfts, nftsLoading] = hooks.useAllNfts();
  const pools = hooks.useAllPools(axios);
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
      {(
        <TokenContext.Provider value={{ tokens: tokens || [], loading: tokens === null && !(selectedSigner?.balance._hex === '0x00') }}>
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
                  <Route path={BUY_URL} component={Onramp} />
                  <Route path={ONRAMP_URL} component={Onramp} />
                  <Route path={SNAP_URL} component={Snap} />
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
                  <Route path={SNAP_URL} component={Snap} />
                  <Route path="/" render={() => (<Redirect to={DASHBOARD_URL} />)} />
                </Switch>
                )}
              </TokenPrices.Provider>
            </PoolContext.Provider>
          </NftContext.Provider>
        </TokenContext.Provider>
      )}
    </div>
  );
};

export default ContentRouter;
