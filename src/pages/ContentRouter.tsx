import { AddressToNumber, hooks, TokenWithAmount } from '@reef-chain/react-lib';
import React, { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
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
import Transfer from './transfer/Transfer';
import { isReefswapUI } from '../environment';
import Onramp from './onramp/Onramp';
import ReefSigners from '../context/ReefSigners';
import Snap from './snap/Snap';
import { utils } from '@reef-chain/react-lib';
import { tokenPriceUtils, tokenUtil } from '@reef-chain/util-lib';

const ContentRouter = (): JSX.Element => {
  const { reefState, selectedSigner } = useContext(ReefSigners);

  // const [tokenPrices, setTokenPrices] = useState({} as AddressToNumber<number>);
  // Its not appropriate to have token state in this component, but the problem was apollo client.
  // Once its declared properly in App move TokenContext in the parent component (App.tsx)

  const tokens = hooks.useObservableState<TokenWithAmount[] | null>(reefState.selectedTokenPrices$, []);

  const [nfts, nftsLoading] = hooks.useAllNfts();
  const pools = hooks.useAllPools(axios);

  const { REEF_ADDRESS } = utils;
  const reefPrice = hooks.useObservableState(tokenUtil.reefPrice$)

  let tokenPrices = {
    [REEF_ADDRESS]: reefPrice ? (reefPrice as any).data : 0
  };

  tokenPriceUtils.calculateTokenPrices(pools, tokenPrices);

  return (
    <div className="content">
      {(
        <TokenContext.Provider value={{ tokens: tokens || [], loading: tokens === null && !(selectedSigner?.balance._hex === '0x00') }}>
          <NftContext.Provider value={{ nfts, loading: nftsLoading }}>
            <PoolContext.Provider value={pools}>
              <TokenPrices.Provider value={tokenPrices as AddressToNumber<number>}>
                {!isReefswapUI && (
                  <Routes>
                    <Route path={SPECIFIED_SWAP_URL} element={<Swap/>} />
                    {/* <Route   path={POOLS_URL} element={Pools} /> */}
                    <Route path={DASHBOARD_URL} element={<Dashboard/>} />
                    {/* <Route path={ADD_LIQUIDITY_URL} element={AddPoolLiquidity} /> */}
                    {/* <Route   path={ADD_LIQUIDITY_URL} element={AddPoolLiquidity} /> */}
                    {/* <Route path={POOL_CHART_URL} element={Pool} /> */}
                    {/* <Route path={REMOVE_LIQUIDITY_URL} element={RemoveLiquidity} /> */}
                    <Route path={TRANSFER_TOKEN} element={<Transfer/>} />
                    <Route path={CREATE_ERC20_TOKEN_URL} element={<Creator/>} />
                    <Route path={BONDS_URL} element={<Bonds/>} />
                    <Route path={BIND_URL} element={<Bind/>} />
                    <Route path={BUY_URL} element={< Onramp/>} />
                    <Route path={ONRAMP_URL} element={<Onramp/>} />
                    <Route path={SNAP_URL} element={<Snap/>} />
                    <Route path="/" element={<Navigate to={DASHBOARD_URL} replace />} />

                  </Routes>
                )}

                {isReefswapUI && (
                  <Routes>
                    <Route path={SPECIFIED_SWAP_URL} element={<Swap />} />
                    <Route path={POOLS_URL} element={<Pools />} />
                    <Route path={DASHBOARD_URL} element={<Dashboard />} />
                    <Route path={ADD_LIQUIDITY_URL} element={<AddPoolLiquidity/>} />
                    <Route path={ADD_LIQUIDITY_URL} element={<AddPoolLiquidity/>} />
                    <Route path={POOL_CHART_URL} element={<Pool/>} />
                    <Route path={REMOVE_LIQUIDITY_URL} element={<RemoveLiquidity/>} />
                    <Route path={TRANSFER_TOKEN} element={<Transfer/>} />
                    <Route path={CREATE_ERC20_TOKEN_URL} element={<Creator/>} />
                    <Route path={BONDS_URL} element={<Bonds/>} />
                    <Route path={BIND_URL} element={<Bind/>} />
                    <Route path={BUY_URL} element={<Buy/>} />
                    <Route path={ONRAMP_URL} element={<Onramp/>} />
                    <Route path={SNAP_URL} element={<Snap/>} />
                    <Route path="/" element={<Navigate to={DASHBOARD_URL} replace />} />

                  </Routes>
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
