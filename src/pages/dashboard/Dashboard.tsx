import Uik from '@reef-chain/ui-kit';
import BigNumber from 'bignumber.js';
import React, { useContext, useMemo, useState } from 'react';
import { network as nw } from '@reef-chain/util-lib';
import NftContext from '../../context/NftContext';
import TokenContext from '../../context/TokenContext';
import TokenPricesContext from '../../context/TokenPricesContext';
import BuyReefButton from './BuyReefButton';
import { Balance } from './Balance';
import './Dashboard.css';
import { Staking } from './Staking';
import { Nfts } from './Nfts';
import { TokenBalances } from './TokenBalances';
import { Activity } from './Activity/Activity';
import { isReefswapUI } from '../../environment';
import { localizedStrings } from '../../l10n/l10n';
import GetReefTestnetButton from './GetReefTestnetButton';
import ReefSigners from '../../context/ReefSigners';
import useAccountSelector from '../../hooks/useAccountSelector';
import { useHistory } from 'react-router-dom';
import { POOLS_URL } from '../../urls';

const Dashboard = (): JSX.Element => {
  const history = useHistory();
  const { network } = useContext(ReefSigners);
  const { nfts } = useContext(NftContext);
  const { selectedSigner } = useContext(ReefSigners);
  const { setIsAccountSelectorOpen } = useAccountSelector();
  const tabs = (() => [
    { value: 'tokens', text: localizedStrings.tokens_pill || 'Tokens' },
    { value: 'bonds', text: localizedStrings.bonds || 'Bonds' },
    { value: 'nfts', text: localizedStrings.nfts || 'NFTs' },
  ])();

  const { tokens, loading } = useContext(TokenContext);
  const tokenPrices = useContext(TokenPricesContext);

  const [tab, setTab] = useState<string>(tabs[0].value);

  const totalBalance = useMemo(() => tokens.reduce(
    (acc, { balance, decimals, address }) => acc.plus(
      new BigNumber(balance.toString())
        .div(new BigNumber(10).pow(decimals))
        .multipliedBy(Number.isNaN(+tokenPrices[address]) ? 0 : tokenPrices[address]),
    ),
    new BigNumber(0),
  ).toNumber(),
    [tokenPrices, tokens]);

  return (
    selectedSigner ?
      <div className="dashboard">
        <div className="dashboard__top">
          <div className="dashboard__top-left">
            <Balance balance={totalBalance} loading={loading} />
            {/* <Rewards rewards={0} /> */}
          </div>
          <div className="dashboard__top-right">
            {network?.name !== nw.AVAILABLE_NETWORKS.mainnet.name && <GetReefTestnetButton />}
            {network?.name === nw.AVAILABLE_NETWORKS.mainnet.name && <BuyReefButton />}
          </div>
        </div>

        <div className="dashboard__main">
          <div className="dashboard__left">

            {!isReefswapUI && (
              <Uik.Tabs
                className="dashboard__tabs "
                options={tabs}
                value={tab}
                onChange={(e) => setTab(e)}
              />
            )}
            {isReefswapUI && (<Uik.Text type="title" text="Tokens" className="tokens__title" />)}

            {tab === 'tokens' ? <TokenBalances tokens={tokens} /> : ''}
            {tab === 'bonds' ? <Staking /> : ''}
            {tab === 'nfts' ? <Nfts nfts={nfts} /> : ''}
          </div>

          <div className="dashboard__right">
            <Activity />
          </div>
        </div>
      </div> : <div className='no-account-dashboard'>
        {isReefswapUI ?
          <>
            <div>
              <Uik.Text text="Wallet is not connected, Navigate to Pools or Connect Wallet" type="light" className="mb-2" />
              <div className='reef-swap-ui-btn-group'>
                <Uik.Button text="Open Pools" className="mr-1" onClick={() => history.push(POOLS_URL)} />
                <Uik.Button text="Connect Wallet" onClick={() => setIsAccountSelectorOpen(true)} fill />
              </div>
            </div>
          </>
          :
          <>
            <Uik.Text text="No account selected" type="light" className="mb-2" />
            <Uik.Button text="Select Account" onClick={() => setIsAccountSelectorOpen(true)} fill />
          </>
        }

      </div>
  );
};

export default Dashboard;
