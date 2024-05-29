import React, { createContext, useState, useContext, ReactNode } from 'react';
import { extension as reefExt } from '@reef-chain/util-lib';

interface WcPreloaderProps {
  loading: boolean;
  setLoading: (_loading:boolean) => void;
}

const WcPreloaderContext = createContext<WcPreloaderProps | undefined>(undefined);

export const WcPreloaderProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setIsLoading] = useState<boolean>(false);

  const setLoading = (_loading: boolean) => {
    setIsLoading(_loading);
  };

  return (
    <WcPreloaderContext.Provider value={{ loading, setLoading }}>
      {children}
    </WcPreloaderContext.Provider>
  );
};

export default WcPreloaderContext;