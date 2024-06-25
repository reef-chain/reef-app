import { ReefSigner, defaultOptions, hooks } from '@reef-chain/react-lib';
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
import useConnectedWallet from './hooks/useConnectedWallet';
import useWcPreloader from './hooks/useWcPreloader';
import WcPreloader from './common/WcPreloader';
import useAccountSelector from './hooks/useAccountSelector';

const { WalletSelector, walletSelectorOptions } = Components;

export const availableWalletOptions = [
  walletSelectorOptions[reefExt.REEF_EXTENSION_IDENT],
  // walletSelectorOptions[reefExt.REEF_SNAP_IDENT],
  // walletSelectorOptions[reefExt.REEF_EASY_WALLET_IDENT],
  walletSelectorOptions[reefExt.REEF_WALLET_CONNECT_IDENT]
];

export const connectWalletConnect = async(ident:string,setSelExtensionName:any,setWcPreloader:any)=>{
  setWcPreloader({
    value:true,
    message:"initializing mobile app connection"
  });
  setSelExtensionName(undefined); //force setting this to different value from the ident initially or else it doesn't call useInitReefState hook

  const response:reefExt.WcConnection | undefined = await connectWc(setWcPreloader)
  console.log('connectWalletConnect',response);
      if (response) {
        reefExt.injectWcAsExtension(response, { name: reefExt.REEF_WALLET_CONNECT_IDENT, version: "1.0.0" });
        setSelExtensionName(ident);
        // display preloader 
        setWcPreloader({
          value:true,
          message:"wait while we are establishing a connection"
        });
      } else {
        // if proposal expired, recursively call
        Uik.notify.danger("Connection QR expired, reloading")
        await connectWalletConnect(ident,setSelExtensionName,setWcPreloader);
      }
    }

const App = (): JSX.Element => {
  const {selExtensionName,setSelExtensionName} = useConnectedWallet();
  const {loading:wcPreloader,setLoading:setWcPreloader} = useWcPreloader()
  const [accounts,setAccounts] = useState<ReefSigner[]>([]);
  const [selectedSigner,setSelectedSigner] = useState<ReefSigner | undefined>(undefined);
  const {
    loading, error, signers, selectedReefSigner, network, provider, reefState, extension
  } = hooks.useInitReefStateExtension(
    'Reef App', selExtensionName, { ipfsHashResolverFn: getIpfsGatewayUrl },
  );

  useEffect(()=>{
    setAccounts([]);
    setSelectedSigner(undefined);
  },[selExtensionName])

  useEffect(()=>{
    setAccounts(signers);
    setSelectedSigner(selectedReefSigner);

    // if account connected , hide preloader & set account address
    if(signers?.length && signers?.indexOf(selectedReefSigner!)==-1){
      reefState.setSelectedAddress(signers[0].address)
    }
  },[selectedReefSigner,signers])

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
      // disable wallet connect loader if exists 
      setWcPreloader({
        value:false,message:""
      })
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
  if(wcPreloader.value && signers.length){
    setWcPreloader({
      value:false,
      message:""
    })
  }
},[signers])



  const onExtensionSelected = async(ident: string) => {
    console.log('onExtensionSelected', ident);
    try {
      if (ident === reefExt.REEF_WALLET_CONNECT_IDENT) {
        await connectWalletConnect(ident,setSelExtensionName,setWcPreloader);
      } else {
        setSelExtensionName(ident);
      }
    } catch (error) {
     console.log(error); 
    }
  }

  const {isAccountSelectorOpen} = useAccountSelector()

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
              accounts,
              selectedSigner,
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
                         />
                        <ContentRouter />
                        <NetworkSwitching isOpen={isNetworkSwitching} />
                        <WcPreloader wcPreloader={wcPreloader} />

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
