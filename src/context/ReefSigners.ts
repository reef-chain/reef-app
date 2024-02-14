import { createContext } from 'react';
import { ReefSigner } from '@reef-chain/react-lib';
import { Network } from '@reef-chain/util-lib/dist/dts/network/index';
import type { reefState } from '@reef-chain/util-lib';
import { Provider } from '@reef-chain/evm-provider';

// @ts-ignore
export type ReefState = reefState;

interface ReefSignersContext {
  accounts: ReefSigner[]|undefined;
  selectedSigner:ReefSigner|undefined;
  network: Network;
  provider: Provider|undefined;
  reefState: ReefState;
}
export default createContext<ReefSignersContext>({
  accounts: [],
  selectedSigner: undefined,
  network: undefined,
  provider: undefined,
  reefState: undefined,
});
