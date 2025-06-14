import { ReefSigner } from '@reef-chain/react-lib';
import { BigNumber } from 'ethers';

export interface SignerWithLocked extends ReefSigner {
  freeBalance: BigNumber;
  lockedBalance: BigNumber;
}
