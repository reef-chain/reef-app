import { defaultOptions, hooks } from '@reef-chain/react-lib';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Uik from '@reef-chain/ui-kit';
import Nav from './common/Nav';
import OptionContext from './context/OptionContext';
import ReefSignersContext from './context/ReefSigners';
import ContentRouter from './pages/ContentRouter';
import NoAccount from './pages/error/NoAccount';
import NoExtension from './pages/error/NoExtension';
import { notify } from './utils/utils';
import HideBalance, { getStoredPref, toggleHidden } from './context/HideBalance';
import NetworkSwitch, { setSwitching } from './context/NetworkSwitch';
import Bind from './common/Bind/Bind';
import NetworkSwitching from './common/NetworkSwitching';
import { getIpfsGatewayUrl } from './environment';
import { useMagicSquareParamsSave } from './utils/magicsquareService';

const App = (): JSX.Element => {
  useMagicSquareParamsSave();
  const {
    loading, error, signers, selectedReefSigner, network, provider, reefState,
  } = hooks.useInitReefState(
    'Reef Wallet App', { ipfsHashResolverFn: getIpfsGatewayUrl },
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

  // @ts-ignore
  // @ts-ignore
  return (
    loading && !error
      ? (
        <div className="App w-100 h-100 d-flex justify-content-center align-items-middle">
          <Uik.Loading />
        </div>
      )
      : (
        <>
          <OptionContext.Provider value={{ ...defaultOptions, back: history.goBack, notify }}>
            <ReefSignersContext.Provider value={{
              accounts: signers, selectedSigner: selectedReefSigner, network, reefState, provider,
            }}
            >
              <HideBalance.Provider value={hideBalance}>
                <NetworkSwitch.Provider value={networkSwitch}>
                  <div className="App d-flex w-100 h-100">
                    <div className="w-100 main-content">
                      {!loading && !error && (
                        <>
                          <Nav display={!loading && !error} />
                          <ContentRouter />
                        </>
                      )}

                      <NetworkSwitching isOpen={isNetworkSwitching} />

                      {error?.code === 1 && <NoExtension />}
                      {error?.code === 2 && <NoAccount />}
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
                </NetworkSwitch.Provider>
              </HideBalance.Provider>
            </ReefSignersContext.Provider>
          </OptionContext.Provider>
        </>
      )
  );
};

export default App;
