import React, { useEffect, useState } from 'react';
import Uik from '@reef-chain/ui-kit';
import BigNumber from 'bignumber.js';
import PercentSlider from '../PercentSlider';
import { localizedStrings as strings } from '../../../l10n/l10n';
import { displayBalance } from '../../../utils/displayBalance';

interface Props {
  bondAmount: number;
  setBondAmount(value: number): void;
  availableAmount: number;
  activeStake: number;
  unbondingAmount: BigNumber;
  stakeNumber: number;
  loading: boolean;
  handleBond(): void;
  handleUnbond(): void;
  redeemableBalance: BigNumber;
  unbondingInitiated: boolean;
  handleWithdraw(): void;
}

export default function BondTab({
  bondAmount,
  setBondAmount,
  availableAmount,
  activeStake,
  unbondingAmount,
  stakeNumber,
  loading,
  handleBond,
  handleUnbond,
  redeemableBalance,
  unbondingInitiated,
  handleWithdraw,
}: Props): JSX.Element {
  const isBonding = stakeNumber === 0;
  const maxValue = isBonding ? availableAmount : activeStake;
  const roundToTwo = (val: number): number => {
    if (!Number.isFinite(val)) return 0;
    return Math.round(val * 100) / 100;
  };
  const clampValue = (val: number): number => {
    if (!Number.isFinite(val)) return 0;
    const upperBound = Math.max(0, maxValue);
    return Math.min(upperBound, Math.max(0, val));
  };

  const [inputValue, setInputValue] = useState(roundToTwo(bondAmount).toFixed(2));

  useEffect(() => {
    const rounded = roundToTwo(bondAmount);
    const clamped = clampValue(rounded);
    setInputValue(clamped.toFixed(2));
    if (clamped !== bondAmount) {
      setBondAmount(clamped);
    }
  }, [bondAmount, maxValue, setBondAmount]);

  const handleInputChange = (value: string): void => {
    setInputValue(value);
    if (value === '') {
      setBondAmount(0);
      return;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    const clamped = clampValue(roundToTwo(parsed));
    setBondAmount(clamped);
  };

  const handleSliderChange = (value: number): void => {
    const clamped = clampValue(roundToTwo(value));
    setBondAmount(clamped);
    setInputValue(clamped.toFixed(2));
  };

  const sliderValue = clampValue(roundToTwo(bondAmount));
  const canWithdraw = redeemableBalance.isGreaterThan(0);
  const canUnbond = !isBonding && maxValue > 0;
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
      {unbondingAmount.isGreaterThan(0) && (
        <Uik.Text type="mini">
          Unbonding: {`${displayBalance(unbondingAmount.toFixed())} REEF`}
        </Uik.Text>
      )}
      <Uik.Card className="bond-action-card bond-action-card-button">
        <>
          <Uik.Button
            success
            text={isBonding ? strings.staking_bond : strings.staking_unbond}
            loading={loading}
            disabled={!isBonding && !canUnbond}
            onClick={isBonding ? handleBond : handleUnbond}
          />
          {unbondingInitiated && (
            <Uik.Button
              text="Withdraw"
              fill={canWithdraw}
              disabled={!canWithdraw}
              onClick={handleWithdraw}
            />
          )}
        </>
      </Uik.Card>
    </div>
  );
}
