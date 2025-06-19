import React from 'react';
import Uik from '@reef-chain/ui-kit';
import BN from 'bn.js';
import PercentSlider from '../PercentSlider';
import { localizedStrings as strings } from '../../../l10n/l10n';

interface Props {
  bondAmount: number;
  setBondAmount(value: number): void;
  availableAmount: number;
  lockedAmount: number;
  stakeNumber: number;
  loading: boolean;
  handleBond(): void;
  handleUnbond(): void;
  redeemableBalance: BN;
  unbondingInitiated: boolean;
  handleWithdraw(): void;
}

export default function BondTab({
  bondAmount,
  setBondAmount,
  availableAmount,
  lockedAmount,
  stakeNumber,
  loading,
  handleBond,
  handleUnbond,
  redeemableBalance,
  unbondingInitiated,
  handleWithdraw,
}: Props): JSX.Element {
  const maxValue = stakeNumber === 0 ? availableAmount : lockedAmount;
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
                value={bondAmount.toString()}
                min={0}
                max={maxValue}
                onInput={(e) =>
                  setBondAmount(Number((e.target as HTMLInputElement).value))
                }
              />
            </div>
          </div>
        </div>
      </Uik.Card>
      <Uik.Card className="bond-action-card">
        <PercentSlider
          max={maxValue}
          value={bondAmount}
          onChange={setBondAmount}
        />
      </Uik.Card>
      <Uik.Card className="bond-action-card bond-action-card-button">
        <>
          <Uik.Button
            success
            text={stakeNumber === 0 ? strings.staking_bond : strings.staking_unbond}
            loading={loading}
            onClick={stakeNumber === 0 ? handleBond : handleUnbond}
          />
          {unbondingInitiated && (
            <Uik.Button
              text="Withdraw"
              disabled={!redeemableBalance.gt(new BN(0))}
              onClick={handleWithdraw}
            />
          )}
        </>
      </Uik.Card>
    </div>
  );
}
