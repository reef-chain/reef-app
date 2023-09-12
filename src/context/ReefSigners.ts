import { createContext } from 'react';
import { ReefSigner } from '@reef-defi/react-lib';

interface ReefSignersContext {
  accounts: ReefSigner[]|undefined;
  selectedSigner:ReefSigner|undefined;
}
export default createContext<ReefSignersContext>({
  accounts: [],
  selectedSigner: undefined,
});
