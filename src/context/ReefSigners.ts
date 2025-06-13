import { createContext } from 'react';
import { ReefSigner } from '@reef-chain/react-lib';
import { BigNumber } from 'ethers';
import { network as nw, extension as extReef } from '@reef-chain/util-lib';
import { Provider } from '@reef-chain/evm-provider';
import { Observable } from 'rxjs';

interface setAddr {
  (val: string | undefined):void;
}
interface setNet {
  (val: nw.Network):void;
}
interface setExt {
  (val: string):void;
}
interface setAccs {
  (val: any[]):void;
}
export interface ReefState {
  setSelectedAddress: setAddr;
  setSelectedNetwork: setNet;
  setSelectedExtension: setExt
  setAccounts:setAccs;
  selectedTokenPrices$: Observable<never>
}

export interface SignerWithLocked extends ReefSigner {
  lockedBalance?: BigNumber;
  freeBalance?: BigNumber;
}

interface ReefSignersContext {
  accounts: SignerWithLocked[]|undefined;
  selectedSigner:SignerWithLocked|undefined;
  network: nw.Network;
  provider: Provider|undefined;
  reefState: ReefState;
  extension: extReef.InjectedExtension;
  selExtName: string|undefined;
}
export default createContext<ReefSignersContext>({
  accounts: [],
  selectedSigner: undefined,
  network: undefined,
  provider: undefined,
  reefState: undefined,
  extension: undefined,
  selExtName: undefined,
});
