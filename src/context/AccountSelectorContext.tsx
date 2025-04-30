import React,{ ReactNode, createContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { SNAP_URL } from "../urls";

interface AccountSelectorContextProps {
    isAccountSelectorOpen: boolean;
    setIsAccountSelectorOpen: (val:boolean) => void;
  }
  
const AccountSelectorContext = createContext<AccountSelectorContextProps | undefined>(undefined);


export const AccountSelectorProvider = ({ children }: { children: ReactNode }) => {  
  const location = useLocation();
    const [isAccountSelectorOpen, setIsAccountSelectorOpen] = useState<boolean>(location.pathname !== SNAP_URL);
  
    return (
      <AccountSelectorContext.Provider value={{isAccountSelectorOpen, setIsAccountSelectorOpen}}>
        {children}
      </AccountSelectorContext.Provider>
    );
  };
  
  export default AccountSelectorContext;