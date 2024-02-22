import { createContext } from 'react';
import { ReefSigner } from '@reef-chain/react-lib';
import { network as nw, extension as extReef } from '@reef-chain/util-lib';
import { Provider } from '@reef-chain/evm-provider';
import {Observable} from "rxjs";

interface setAddr {
  (val: string | undefined):void;
}
interface setNet {
  (val: nw.Network):void;
}
interface setAccs {
  (val: any[]):void;
}
export interface ReefState {
  setSelectedAddress: setAddr;
  setSelectedNetwork: setNet;
  setAccounts:setAccs;
  selectedTokenPrices$: Observable<never>
}

interface ReefSignersContext {
  accounts: ReefSigner[]|undefined;
  selectedSigner:ReefSigner|undefined;
  network: nw.Network;
  provider: Provider|undefined;
  reefState: ReefState;
  extension: extReef.InjectedExtension|undefined;
}
export default createContext<ReefSignersContext>({
  accounts: [],
  selectedSigner: undefined,
  network: undefined,
  provider: undefined,
  reefState: undefined,
  extension: undefined,
});
