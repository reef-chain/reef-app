import React from 'react';
import Uik from '@reef-chain/ui-kit';
import PercentSlider from '../PercentSlider';
import { localizedStrings as strings } from '../../../l10n/l10n';

interface Props {
  stakeAmount: number;
  setStakeAmount(value: number): void;
  stakingMaxValue: number;
  loading: boolean;
  handleStake(): void;
}

export default function StakingTab({
  stakeAmount,
  setStakeAmount,
  stakingMaxValue,
  loading,
  handleStake,
}: Props): JSX.Element {
  return (
    <div className="bond-action-wrapper">
      <Uik.Card className="bond-action-card">
        <div className="uik-pool-actions-token">
          <div className="uik-pool-actions-token__token">
            <div className="uik-pool-actions-token__select-wrapper">
              <Uik.ReefIcon />
              <span>REEF</span>
            </div>
            <div className="uik-pool-actions-token__value">
              <Uik.Input
                type="number"
                value={stakeAmount.toString()}
                min={0}
                max={stakingMaxValue}
                onInput={(e) =>
                  setStakeAmount(Number((e.target as HTMLInputElement).value))
                }
              />
            </div>
          </div>
        </div>
      </Uik.Card>
      <Uik.Card className="bond-action-card">
        <PercentSlider
          max={stakingMaxValue}
          value={stakeAmount}
          onChange={setStakeAmount}
        />
      </Uik.Card>
      <Uik.Text type="mini" className="bond-action-warning">
        {strings.staking_fees_warning}
      </Uik.Text>
      <Uik.Card className="bond-action-card bond-action-card-button">
        <Uik.Button
          success
          text={strings.stake}
          loading={loading}
          onClick={handleStake}
        />
      </Uik.Card>
    </div>
  );
}
