import { createContext } from 'react';
import { PoolWithReserves } from '@reef-chain/react-lib';

export default createContext<PoolWithReserves[]>([]);
