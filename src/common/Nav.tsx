import React, { useContext, useMemo } from 'react';
import {
  appState, availableNetworks, Components, hooks, Network, ReefSigner,
} from '@reef-defi/react-lib';
import './Nav.css';
import { Link, useHistory, useLocation } from 'react-router-dom';
import Uik from '@reef-chain/ui-kit';
import { saveSignerLocalPointer } from '../store/internalStore';
import {
  BONDS_URL, CREATE_ERC20_TOKEN_URL, DASHBOARD_URL, POOLS_URL,
} from '../urls';
import { appAvailableNetworks, isReefswapUI } from '../environment';
import HideBalance from '../context/HideBalance';
import NetworkSwitch from '../context/NetworkSwitch';
import { localizedStrings } from '../l10n/l10n';
import {reefState} from "@reef-chain/util-lib";
import ReefSigners from '../context/ReefSigners';

export interface Nav {
    display: boolean;
}

const Nav = ({ display }: Nav): JSX.Element => {
  const history = useHistory();
  const { pathname } = useLocation();
  const signer: ReefSigner|undefined|null =  useContext(ReefSigners).selectedSigner;
  const accounts: ReefSigner[]|undefined|null = useContext(ReefSigners).accounts;
  const network: Network|undefined = hooks.useObservableState(reefState.selectedNetwork$);
  const mainnetSelected = network == null || network?.rpcUrl === availableNetworks.mainnet.rpcUrl;
  let menuItems = [
    { title: localizedStrings.dashboard, url: DASHBOARD_URL },
    { title: localizedStrings.bonds, url: BONDS_URL },
  ];
  if (isReefswapUI) {
    menuItems = [
      { title: localizedStrings.tokens_pill, url: DASHBOARD_URL },
      { title: localizedStrings.pools, url: POOLS_URL },
      { title: localizedStrings.creator, url: CREATE_ERC20_TOKEN_URL },
    ];
  }

  const hideBalance = useContext(HideBalance);
  const networkSwitch = useContext(NetworkSwitch);

  const selectAccount = (index: number): void => {
    saveSignerLocalPointer(index);
    console.log(accounts?.[index].address)
    reefState.setSelectedAddress(index != null ? accounts?.[index].address : undefined);
  };

  const selectNetwork = (key: 'mainnet' | 'testnet'): void => {
    const toSelect = appAvailableNetworks.find((item) => item.name === key);
    networkSwitch.setSwitching(true);
    history.push(DASHBOARD_URL);

    if (toSelect) {
      appState.setCurrentNetwork(toSelect);
    }
  };

  const selectLanguage = (key: 'en'|'hi'):void => {
    localizedStrings.setLanguage(key);
    localStorage.setItem('app-language', key);
    history.push(DASHBOARD_URL);
  };

  const menuItemsView = menuItems
    .map((item) => {
      let classes = 'navigation_menu-items_menu-item';
      if (pathname === item.url) {
        classes += ' navigation_menu-items_menu-item--active';
      }
      return (
        <li key={item.title} className={classes}>
          <Link to={item.url} className="navigation_menu-items_menu-item_link">
            {item.title}
          </Link>
        </li>
      );
    });

  const selectedNetwork = useMemo(() => {
    const name = network?.name;

    if (name === 'mainnet' || name === 'testnet') {
      return name;
    }

    return undefined;
  }, [network]);

  return (
    <div className="nav-content navigation d-flex d-flex-space-between">
      <div className="navigation__wrapper">
        <button type="button" className="logo-btn" onClick={() => { history.push('/'); }}>
          { mainnetSelected ? <Uik.ReefLogo className="navigation__logo" /> : <Uik.ReefTestnetLogo className="navigation__logo" /> }
          {isReefswapUI && <span className="navigation__logo-suffix">swap</span>}
        </button>

        {display && (
          <nav className="d-flex justify-content-end d-flex-vert-center">
            <ul className="navigation_menu-items ">
              {menuItemsView}
            </ul>
            {accounts && !!accounts.length && network && (

            <Components.AccountSelector
              accounts={accounts}
              selectedSigner={signer || undefined}
              selectAccount={selectAccount}
              onNetworkSelect={selectNetwork}
              selectedNetwork={selectedNetwork}
              isBalanceHidden={hideBalance.isHidden}
              showBalance={hideBalance.toggle}
              onLanguageSelect={selectLanguage}
            />
            )}
          </nav>
        )}
      </div>
    </div>
  );
};

export default Nav;
