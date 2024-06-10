import React,{ ReactNode, createContext, useState } from "react";
import { useHistory } from "react-router-dom";
import { SNAP_URL } from "../urls";

interface AccountSelectorContextProps {
    isAccountSelectorOpen: boolean;
    setIsAccountSelectorOpen: (val:boolean) => void;
  }
  
const AccountSelectorContext = createContext<AccountSelectorContextProps | undefined>(undefined);


export const AccountSelectorProvider = ({ children }: { children: ReactNode }) => {  
    const history = useHistory();
    const [isAccountSelectorOpen, setIsAccountSelectorOpen] = useState<boolean>(history.location.pathname !== SNAP_URL);
  
    return (
      <AccountSelectorContext.Provider value={{isAccountSelectorOpen, setIsAccountSelectorOpen}}>
        {children}
      </AccountSelectorContext.Provider>
    );
  };
  
  export default AccountSelectorContext;