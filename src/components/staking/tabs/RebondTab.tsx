import React, { useEffect, useState } from 'react';
import Uik from '@reef-chain/ui-kit';
import BigNumber from 'bignumber.js';
import PercentSlider from '../PercentSlider';
import { localizedStrings as strings } from '../../../l10n/l10n';
import { displayBalance } from '../../../utils/displayBalance';

interface Props {
  rebondAmount: number;
  setRebondAmount(value: number): void;
  unbondingAmount: BigNumber;
  loading: boolean;
  handleRebond(): void;
  redeemableBalance: BigNumber;
  handleWithdraw(): void;
}

export default function RebondTab({
  rebondAmount,
  setRebondAmount,
  unbondingAmount,
  loading,
  handleRebond,
  redeemableBalance,
  handleWithdraw,
}: Props): JSX.Element {
  const maxValue = Math.max(0, unbondingAmount.toNumber());

  const roundToTwo = (val: number): number => {
    if (!Number.isFinite(val)) return 0;
    return Math.round(val * 100) / 100;
  };

  const clampValue = (val: number): number => {
    if (!Number.isFinite(val)) return 0;
    return Math.min(maxValue, Math.max(0, val));
  };

  const [inputValue, setInputValue] = useState(roundToTwo(rebondAmount).toFixed(2));

  useEffect(() => {
    const rounded = roundToTwo(rebondAmount);
    const clamped = clampValue(rounded);
    setInputValue(clamped.toFixed(2));
    if (clamped !== rebondAmount) {
      setRebondAmount(clamped);
    }
  }, [rebondAmount, maxValue, setRebondAmount]);

  const handleInputChange = (value: string): void => {
    setInputValue(value);
    if (value === '') {
      setRebondAmount(0);
      return;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    const clamped = clampValue(roundToTwo(parsed));
    setRebondAmount(clamped);
  };

  const handleSliderChange = (value: number): void => {
    const clamped = clampValue(roundToTwo(value));
    setRebondAmount(clamped);
    setInputValue(clamped.toFixed(2));
  };

  const sliderValue = clampValue(roundToTwo(rebondAmount));
  const canWithdraw = redeemableBalance.isGreaterThan(0);
  const canRebond = maxValue > 0 && rebondAmount > 0 && rebondAmount <= maxValue;

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
                max={maxValue}
                onChange={(e) => handleInputChange((e.target as HTMLInputElement).value)}
              />
            </div>
          </div>
        </div>
      </Uik.Card>
      <Uik.Card className="bond-action-card">
        <PercentSlider
          max={maxValue}
          value={sliderValue}
          onChange={handleSliderChange}
        />
      </Uik.Card>
      <Uik.Text type="mini">
        Unbonded: {`${displayBalance(unbondingAmount.toFixed())} REEF`}
      </Uik.Text>
      <Uik.Card className="bond-action-card bond-action-card-button">
        <>
          <Uik.Button
            success
            text={strings.staking_rebond}
            loading={loading}
            disabled={!canRebond}
            onClick={handleRebond}
          />
          <Uik.Button
            text="Withdraw"
            fill={canWithdraw}
            disabled={!canWithdraw}
            onClick={handleWithdraw}
          />
        </>
      </Uik.Card>
    </div>
  );
}
