import React, { useContext } from 'react';
import './Staking.css';
import {
  appState, hooks, Network, ReefSigner,
} from '@reef-defi/react-lib';
import { BondsComponent } from '../bonds/BondsComponent';
import { bonds, IBond } from '../bonds/utils/bonds';
import { localizedStrings as strings } from '../../l10n/l10n';
import {reefState} from "@reef-chain/util-lib";
import ReefSigners from '../../context/ReefSigners';

export const Staking = (): JSX.Element => {
  const selectedSigner: ReefSigner|undefined|null =  useContext(ReefSigners).selectedSigner;
  const network: Network | undefined = hooks.useObservableState(reefState.selectedNetwork$);

  return (
    <div className="staking">
      {
        bonds?.filter((bond) => bond.network === network?.name).length
          ? (
            <div className="staking__bonds">
              <>
                {network && selectedSigner ? (
                  bonds
                    .filter((bond) => bond.network === network.name)
                    .map((bond: IBond) => (
                      <BondsComponent
                        key={bond.id}
                        account={selectedSigner}
                        bond={bond}
                        onlyActive
                      />
                    ))
                ) : <div />}
              </>
            </div>
          )
          : <div>{strings.no_bonds_available}</div>
      }
    </div>
  );
};
