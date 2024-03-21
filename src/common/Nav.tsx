import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Components,
} from '@reef-chain/react-lib';
import { network as nw, extension as reefExt } from '@reef-chain/util-lib';
import './Nav.css';
import { Link, useHistory, useLocation } from 'react-router-dom';
import Uik from '@reef-chain/ui-kit';
import { saveAs } from 'file-saver';
import { saveSignerLocalPointer } from '../store/internalStore';
import {
  BONDS_URL, CREATE_ERC20_TOKEN_URL, DASHBOARD_URL, POOLS_URL,
} from '../urls';
import { appAvailableNetworks, isReefswapUI } from '../environment';
import HideBalance from '../context/HideBalance';
import NetworkSwitch from '../context/NetworkSwitch';
import { localizedStrings } from '../l10n/l10n';
import ReefSigners from '../context/ReefSigners';
import { AccountCreationData } from '@reef-chain/ui-kit/dist/ui-kit/components/organisms/AccountSelector/AccountSelector';
import { sendToSnap } from '../utils/snap';
import { getMetadata } from '../utils/metadata';

export interface Nav {
    display: boolean;
}

const Nav = ({ display }: Nav): JSX.Element => {
  const history = useHistory();
  const { pathname } = useLocation();
  const { accounts, provider, selectedSigner, network, reefState, extensions, selExtName } = useContext(ReefSigners);
  const mainnetSelected = network == null || network?.rpcUrl === nw.AVAILABLE_NETWORKS.mainnet.rpcUrl;
  const [allAccounts, setAllAccounts] = useState(accounts || []);
  const [selectedExtensionName, setSelectedExtensionName] = useState<string | undefined>(selExtName);
  const [showMetadataUpdate, setShowMetadataUpdate] = useState(false);

  useEffect(() => {
    setAllAccounts(accounts || []);
  }, [accounts]);

  useEffect(() => {
    if (provider && selExtName === reefExt.REEF_SNAP_IDENT) {
      const metadata = getMetadata(provider.api);
      sendToSnap('listMetadata').then((metadataList) => {
        const existing = metadataList.find((item) => item.genesisHash === metadata.genesisHash);
        setShowMetadataUpdate(!existing || existing.specVersion < metadata.specVersion);
      });
    }
  }, [provider, selExtName]);
  
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

  const selectExtension = (name: string): void => {
    setSelectedExtensionName(name);
    selectAccount(null);
    try {
      localStorage.setItem("selected_address_reef", "");
    } catch (e) {
      // when cookies disabled localStorage can throw
    }
    reefState.setSelectedExtension(name);
    window.location.reload();
  };

  const selectAccount = (index: number | null): void => {
    saveSignerLocalPointer(index || 0);
    reefState.setSelectedAddress(index != null ? accounts?.[index].address : undefined);
  };

  const selectNetwork = (key: 'mainnet' | 'testnet'): void => {
    const toSelect = appAvailableNetworks.find((item) => item.name === key);
    networkSwitch.setSwitching(true);
    history.push(DASHBOARD_URL);

    if (toSelect) {
      reefState.setSelectedNetwork(toSelect);
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

  const renameAccount = (address: string, newName: string): void => {
    sendToSnap('renameAccount', { addressRename: address, newName });
  }

  const exportAccount = async (address: string, password: string): Promise<void> => {
    const json = await sendToSnap('exportAccount', { 
      addressExport: address,
      passwordExport: password
    });
    const blob = new Blob([JSON.stringify(json)], { type: 'application/json; charset=utf-8' });
    saveAs(blob, `${address}.json`);
  }

  const importAccount = async ({ name, seed, json, password }): Promise<void> => {
    if (name && seed) {
      await sendToSnap('createAccountWithSeed', { seed: seed.trim(), name });
      window.location.reload();
    } else if (json && password) {
      await sendToSnap('importAccount', { json: JSON.parse(json), password });
      window.location.reload();
    } else {
      Uik.notify.danger('Invalid import data');
    }
  }

  const forgetAccount = async (address: string): Promise<void> => {
    const res = await sendToSnap('forgetAccount', { addressForget: address });
    if (res) {
      const accountsUpdated = accounts!.filter((acc) => acc.address !== address);
      reefState.setAccounts(accountsUpdated);
      window.location.reload();
    }
  }

  const updateMetadata = async (): Promise<void> => {
    if (!provider) return;
    const metadata = getMetadata(provider.api);
    const updated = await sendToSnap('provideMetadata', metadata);
    if (updated) setShowMetadataUpdate(false);
  }

  const generateSeed = async (): Promise<AccountCreationData> => {
    return await sendToSnap('createSeed');
  }

  const createAccount = async (seed: string, name: string): Promise<void> => {
    await sendToSnap('createAccountWithSeed', { seed, name });
    window.location.reload();
  }

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
            <Components.AccountSelector
              injectedExtensions={extensions}
              selExtName={selectedExtensionName}
              selectExtension={selectExtension}
              accounts={allAccounts}
              selectedSigner={selectedSigner || undefined}
              selectAccount={selectAccount}
              selectedNetwork={selectedNetwork}
              onNetworkSelect={selectNetwork}
              onLanguageSelect={selectLanguage}
              isBalanceHidden={hideBalance.isHidden}
              showBalance={hideBalance.toggle}
              // availableNetworks={appAvailableNetworks.map((net) => net.name as unknown as Components.Network)}
              availableNetworks={isReefswapUI ? ['testnet'] : ['mainnet', 'testnet']}
              showSnapOptions={true}
              onRename={renameAccount}
              onExport={exportAccount}
              onImport={importAccount}
              onForget={forgetAccount}
              onUpdateMetadata={showMetadataUpdate ? updateMetadata : undefined}
              onStartAccountCreation={generateSeed}
              onConfirmAccountCreation={createAccount}
            />
          </nav>
        )}
      </div>
    </div>
  );
};

export default Nav;
