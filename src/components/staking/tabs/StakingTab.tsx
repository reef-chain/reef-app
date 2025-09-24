import React, { useEffect, useState } from 'react';
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
  const roundToTwo = (val: number): number => {
    if (!Number.isFinite(val)) return 0;
    return Math.max(0, Math.round(val * 100) / 100);
  };

  const displayStakeAmount = roundToTwo(stakeAmount);
  const [inputValue, setInputValue] = useState(displayStakeAmount.toFixed(2));

  useEffect(() => {
    setInputValue(displayStakeAmount.toFixed(2));
  }, [displayStakeAmount]);

  const handleInputChange = (value: string): void => {
    setInputValue(value);
    if (value === '') {
      setStakeAmount(0);
      return;
    }
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      setStakeAmount(roundToTwo(parsed));
    }
  };

  const handleSliderChange = (value: number): void => {
    const rounded = roundToTwo(value);
    setStakeAmount(rounded);
    setInputValue(rounded.toFixed(2));
  };

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
                value={inputValue}
                min={0}
                max={stakingMaxValue}
                onChange={(e) => handleInputChange((e.target as HTMLInputElement).value)}
              />
            </div>
          </div>
        </div>
      </Uik.Card>
      <Uik.Card className="bond-action-card">
        <PercentSlider
          max={stakingMaxValue}
          value={roundToTwo(stakeAmount)}
          onChange={handleSliderChange}
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
