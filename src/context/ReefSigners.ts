import { createContext } from 'react';
import { ReefSigner } from '@reef-defi/react-lib';

interface ReefSignersContext {
  accounts: ReefSigner[]|undefined;
}
export default createContext<ReefSignersContext>({
  accounts: [],
});
