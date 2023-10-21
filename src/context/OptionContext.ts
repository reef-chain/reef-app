import { defaultOptions, DefaultOptions } from '@reef-chain/react-lib';
import { createContext } from 'react';

export default createContext<DefaultOptions>(defaultOptions);
