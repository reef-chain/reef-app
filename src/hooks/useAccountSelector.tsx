import { useContext } from "react";
import AccountSelectorContext from "../context/AccountSelectorContext";

const useAccountSelector = () => {
    const context = useContext(AccountSelectorContext);
    if (!context) {
      throw new Error('useConnectedWallet must be used within a ConnectedWalletProvider');
    }
    return context;
  };
  
  export default useAccountSelector;