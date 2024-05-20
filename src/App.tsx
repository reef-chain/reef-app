import { defaultOptions, hooks } from '@reef-chain/react-lib';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Uik from '@reef-chain/ui-kit';
import { extension as reefExt } from '@reef-chain/util-lib';
import { Components } from '@reef-chain/react-lib';
import Nav from './common/Nav';
import OptionContext from './context/OptionContext';
import ReefSignersContext from './context/ReefSigners';
import ContentRouter from './pages/ContentRouter';
import { notify } from './utils/utils';
import HideBalance, { getStoredPref, toggleHidden } from './context/HideBalance';
import NetworkSwitch, { setSwitching } from './context/NetworkSwitch';
import Bind from './common/Bind/Bind';
import NetworkSwitching from './common/NetworkSwitching';
import { getIpfsGatewayUrl } from './environment';
import { MetaMaskProvider } from './context/MetamaskContext';
import { SNAP_URL } from './urls';
import { connectWc } from './utils/walletConnect';

const { WalletSelector, walletSelectorOptions } = Components;

export const availableWalletOptions = [
  walletSelectorOptions[reefExt.REEF_EXTENSION_IDENT],
  // walletSelectorOptions[reefExt.REEF_SNAP_IDENT],
  // walletSelectorOptions[reefExt.REEF_EASY_WALLET_IDENT],
  walletSelectorOptions[reefExt.REEF_WALLET_CONNECT_IDENT]
];

const App = (): JSX.Element => {
  let selectedWallet: string | null = null;
  try {
    selectedWallet = localStorage.getItem(reefExt.SELECTED_EXTENSION_IDENT);
  } catch (e) {
    // when cookies disabled localStorage can throw
  }

  const [selExtensionName, setSelExtensionName] = useState<string | undefined>(selectedWallet || undefined);
  const {
    loading, error, signers, selectedReefSigner, network, provider, reefState, extension
  } = hooks.useInitReefStateExtension(
    'Reef App', selExtensionName, { ipfsHashResolverFn: getIpfsGatewayUrl },
  );

  const history = useHistory();
  const [isBalanceHidden, setBalanceHidden] = useState(getStoredPref());
  const hideBalance = {
    isHidden: isBalanceHidden,
    toggle: () => toggleHidden(isBalanceHidden, setBalanceHidden),
  };

  const [isNetworkSwitching, setNetworkSwitching] = useState(false);
  const networkSwitch = {
    isSwitching: isNetworkSwitching,
    setSwitching: (value: boolean) => setSwitching(value, setNetworkSwitching),
  };

  useEffect(() => {
    if (!loading && isNetworkSwitching) setNetworkSwitching(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  useEffect(() => {
    if (selExtensionName === reefExt.REEF_SNAP_IDENT && error?.code === 2) {
      history.push(SNAP_URL);
    }
  }, [extension, error]);


  const onExtensionSelected = (ident: string) => {
    console.log('onExtensionSelected', ident);
    if (ident === reefExt.REEF_WALLET_CONNECT_IDENT) {
      connectWc().then(
        (res: reefExt.WcConnection | undefined) => {
          console.log('connectWc', res);
          if (res) {
            reefExt.injectWcAsExtension(res, { name: reefExt.REEF_WALLET_CONNECT_IDENT, version: "1.0.0" });
            setSelExtensionName(ident);
          } else {
            setSelExtensionName(undefined);
          }
        }
      );
    } else {
      setSelExtensionName(ident);
    }
  }

  // @ts-ignore
  return (
    <>
      {loading && !error
        ? (
          <>
            <div className="App w-100 h-100 d-flex justify-content-center align-items-middle">
              <Uik.Loading />
            </div>

            {!selExtensionName &&
              <WalletSelector 
                onExtensionSelect={(extName: string) => onExtensionSelected(extName)} 
                availableExtensions={availableWalletOptions}
              />
            }

            <Uik.Modal
              title={"Connecting to wallet"}
              isOpen={!!selExtensionName}
            >
              <div className="connecting-modal-content">
                <Uik.Loading />
                <Uik.Button onClick={() => setSelExtensionName(undefined)}>Cancel connection</Uik.Button>
              </div>
            </Uik.Modal>
          </>
        )
        : (
        <>
          <OptionContext.Provider value={{ ...defaultOptions, back: history.goBack, notify }}>
            <ReefSignersContext.Provider value={{
              accounts: signers,
              selectedSigner: selectedReefSigner,
              network,
              reefState,
              provider,
              extension,
              selExtName: selExtensionName,
            }}
            >
              <HideBalance.Provider value={hideBalance}>
                <NetworkSwitch.Provider value={networkSwitch}>
                  <MetaMaskProvider>
                    <div className="App d-flex w-100 h-100">
                      <div className="w-100 main-content">
                         <Nav selectExtension={(extName) => onExtensionSelected(extName)} 
                          accountSelectorOpen={history.location.pathname !== SNAP_URL} />
                        <ContentRouter />
                        <NetworkSwitching isOpen={isNetworkSwitching} />

                        <ToastContainer
                          draggable
                          newestOnTop
                          closeOnClick
                          hideProgressBar
                          position={toast.POSITION.BOTTOM_LEFT}
                          autoClose={5000}
                          rtl={false}
                          pauseOnFocusLoss={false}
                          pauseOnHover={false}
                        />

                        <Bind />
                      </div>
                    </div>
                  </MetaMaskProvider>
                </NetworkSwitch.Provider>
              </HideBalance.Provider>
            </ReefSignersContext.Provider>
          </OptionContext.Provider>
        </>
      )}
    </>
  );
};

export default App;
