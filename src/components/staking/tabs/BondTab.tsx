import React from 'react';
import Uik from '@reef-chain/ui-kit';
import BN from 'bn.js';
import PercentSlider from '../PercentSlider';
import { localizedStrings as strings } from '../../../l10n/l10n';

interface Props {
  bondAmount: number;
  setBondAmount(value: number): void;
  bondMaxValue: number;
  stakeNumber: number;
  loading: boolean;
  handleBond(): void;
  handleUnbond(): void;
  redeemableBalance: BN;
  remainingEras: number | null;
  withdrawText: string;
  handleWithdraw(): void;
}

export default function BondTab({
  bondAmount,
  setBondAmount,
  bondMaxValue,
  stakeNumber,
  loading,
  handleBond,
  handleUnbond,
  redeemableBalance,
  remainingEras,
  withdrawText,
  handleWithdraw,
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
                value={bondAmount.toString()}
                min={0}
                max={bondMaxValue}
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
          max={bondMaxValue}
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
          {(redeemableBalance.gt(new BN(0)) || (remainingEras && remainingEras > 0)) && (
            <Uik.Button
              success
              text={withdrawText}
              loading={loading}
              disabled={!redeemableBalance.gt(new BN(0))}
              onClick={handleWithdraw}
            />
          )}
        </>
      </Uik.Card>
    </div>
  );
}
