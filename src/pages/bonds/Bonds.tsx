import React, { useContext } from 'react';
import Uik from '@reef-chain/ui-kit';
import { BondsComponent } from './BondsComponent';
import { bonds, IBond } from './utils/bonds';
import './bonds.css';
import { localizedStrings as strings } from '../../l10n/l10n';
import ReefSigners from '../../context/ReefSigners';

export const Bonds = (): JSX.Element => {
  const { selectedSigner, network } = useContext(ReefSigners);

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
