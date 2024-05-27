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
  const [wcPreloader,setWcPreloader] = useState<boolean>(false);
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
  
  const[errorToast,setErrorToast] = useState<{
    message:String;
    type:String;
  }|undefined>();

  useEffect(()=>{
    if(errorToast){
      if(errorToast.type == "danger"){
        Uik.notify.danger(errorToast.message.toString());
      }else{
        Uik.notify.danger({
          message:errorToast.message.toString(),
          keepAlive: true,
          children:<>
          <Uik.Button
            text='Reconnect'
            fill
            onClick={() => window.location.reload()}
          />
        </>
        })
      }
    }
  },[errorToast])

window.addEventListener("unhandledrejection", (event) => {
    const errorMessage = event.reason?.message || event.reason;
    if (errorMessage === "_canceled") {
      setErrorToast({
        message:"You rejected the transaction",
        type:"danger"
      });
    }else if(errorMessage==="_invalid"){
      setErrorToast({
        message:"Session expired kindly reconnect",
        type:"info"
      })
    }else if(errorMessage==="_noUriFoundWC"){
      setErrorToast({
        message:"Encountered an error in initialization",
        type:"danger"
      })
    }
});

//handle preloader
useEffect(()=>{
  // preloader active
  if(wcPreloader && signers.length){
    // if account connected , hide preloader
    setWcPreloader(false)
  }
},[signers])

const connectWalletConnect = async(ident:string)=>{
  const response:reefExt.WcConnection | undefined = await connectWc()
  console.log('connectWalletConnect',response);
      if (response) {
        reefExt.injectWcAsExtension(response, { name: reefExt.REEF_WALLET_CONNECT_IDENT, version: "1.0.0" });
        setSelExtensionName(ident);
        // display preloader 
        setWcPreloader(true);
      } else {
        // if proposal expired, recursively call
        Uik.notify.danger("Connection QR expired, reloading")
        await connectWalletConnect(ident);
      }
    }



  const onExtensionSelected = async(ident: string) => {
    console.log('onExtensionSelected', ident);
    if (ident === reefExt.REEF_WALLET_CONNECT_IDENT) {
      await connectWalletConnect(ident);
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
                        <Uik.Modal title="Connecting to Mobile App"
        isOpen={wcPreloader}>
          <div>
          <div className='wc-preloader'>
            <div className='wc-loader'></div>
            <img src="/img/wallets/walletconnect.svg" alt="" className='wc-icon-preloader' />
          </div>
          <div className='wc-loader-label' >
            <Uik.Text type="mini" text="wait while we are establishing a connection"/>
            </div>
          </div>
                          </Uik.Modal>

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
