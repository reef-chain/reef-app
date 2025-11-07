import React from 'react';
import Uik from '@reef-chain/ui-kit';
import { localizedStrings as strings } from '../../../l10n/l10n';

interface Props {
  stakeNumber: number;
  loading: boolean;
  handleChill(): void;
}

export default function ChillTab({
  stakeNumber,
  loading,
  handleChill,
}: Props): JSX.Element {
  return (
    <div className="bond-action-wrapper">
      <Uik.Card className="bond-action-card bond-action-card-button">
        <Uik.Button
          danger
          text={strings.staking_chill}
          loading={loading}
          disabled={stakeNumber === 0}
          onClick={handleChill}
        />
      </Uik.Card>
    </div>
  );
}
