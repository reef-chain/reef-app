import { Network } from "@reef-chain/react-lib";
import { Observable, map, shareReplay } from "rxjs";
import { reefState } from '@reef-chain/util-lib';

const dexConfig = {
    mainnet:{
      factoryAddress: '0x380a9033500154872813F6E1120a81ed6c0760a8',
      routerAddress: '0x641e34931C03751BFED14C4087bA395303bEd1A5',
    },
    testnet:{
      factoryAddress: '0x8Fc2f9577f6c58e6A91C4A80B45C03d1e71c031f',
      routerAddress: '0xd855a7c33ebF6566e846B0D6F7Ba7f7e1fe99768',
    }
  }

  export interface DexNetwork extends Network{};

  export const selectedNetworkDex$: Observable<DexNetwork> = reefState.selectedNetwork$.pipe(
      map((network: Network) => {
        return {...network, ...dexConfig[network.name]};
      }),
      shareReplay(1)
  );