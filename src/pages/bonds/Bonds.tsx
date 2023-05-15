import React from 'react';
import {
  appState, hooks, Network, ReefSigner,
} from '@reef-defi/react-lib';
import Uik from '@reef-defi/ui-kit';
import { BondsComponent } from './BondsComponent';
import { bonds, IBond } from './utils/bonds';
import './bonds.css';
import { localizedStrings as strings } from '../../l10n/l10n';

export const Bonds = (): JSX.Element => {
  const selectedSigner: ReefSigner | undefined | null = hooks.useObservableState(appState.selectedSigner$);
  const network: Network | undefined = hooks.useObservableState(appState.currentNetwork$);

  return (
    <div className="bonds-page">
      <Uik.Text type="headline" className="bonds-page__title">{strings.bonds}</Uik.Text>

      <div className="bonds-page__bonds">
        {network && selectedSigner ? (
          bonds
            .filter((bond) => bond.network === network.name)
            .map((bond: IBond) => (
              <BondsComponent
                key={bond.id}
                account={selectedSigner}
                bond={bond}
              />
            ))

        ) : <div />}
      </div>
    </div>
  );
};
