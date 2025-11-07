import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Components } from '@reef-chain/react-lib';
import Uik from '@reef-chain/ui-kit';
import { ApiPromise } from '@polkadot/api';
import BN from 'bn.js';
import BigNumber from 'bignumber.js';
import { bnToBn } from '@polkadot/util';
import { extension as reefExt } from '@reef-chain/util-lib';
import BondTab from './tabs/BondTab';
import RebondTab from './tabs/RebondTab';
import StakingTab from './tabs/StakingTab';
import ChillTab from './tabs/ChillTab';
import './bond-action.css';
import { localizedStrings as strings } from '../../l10n/l10n';
import ReefSigners from '../../context/ReefSigners';

const { OverlayAction } = Components;
const { web3Enable, web3FromSource } = reefExt;
const DECIMALS_BIG = new BigNumber(10).pow(18);

interface Props {
  isOpen: boolean;
  onClose(): void;
  api: ApiPromise;
  accountAddress: string;
  stakeNumber: number;
}

export default function BondActionModal({ isOpen, onClose, api, accountAddress, stakeNumber }: Props): JSX.Element {
  const { selectedSigner } = useContext(ReefSigners);
  const [tab, setTab] = useState<'bond' | 'rebond' | 'staking' | 'chill'>('bond');
  const [availableBalance, setAvailableBalance] = useState<BigNumber>(new BigNumber(0));
  const [stakedBalance, setStakedBalance] = useState<BigNumber>(new BigNumber(0));
  const [redeemableBalance, setRedeemableBalance] = useState<BigNumber>(new BigNumber(0));
  const [unbondingInitiated, setUnbondingInitiated] = useState(false);
  const [unbondingAmount, setUnbondingAmount] = useState<BigNumber>(new BigNumber(0));
  const [bondAmount, setBondAmount] = useState(0);
  const [rebondAmount, setRebondAmount] = useState(0);
  const [stakeAmount, setStakeAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const activeStake = useMemo(() => {
    const result = stakedBalance.minus(unbondingAmount);
    return result.isNegative() ? new BigNumber(0) : result;
  }, [stakedBalance, unbondingAmount]);

  useEffect(() => {
    if (!isOpen) return undefined;

    setBondAmount(0);
    setRebondAmount(0);
    setStakeAmount(0);

    if (selectedSigner) {
      setAvailableBalance(new BigNumber(selectedSigner.freeBalance.toString()).dividedBy(DECIMALS_BIG));
      setStakedBalance(new BigNumber(selectedSigner.lockedBalance.toString()).dividedBy(DECIMALS_BIG));
    }

    let isMounted = true;
    (async () => {
      try {
        await api.isReady;
        if (!isMounted) return;

        const [ledgerOption, currentEraRaw] = await Promise.all([
          api.query.staking.ledger(accountAddress),
          api.query.staking.currentEra(),
        ]);

        type UnlockingJson = {
          value?: string | number;
          era?: string | number;
        };

        const ledgerData = (ledgerOption as any)?.isSome ? (ledgerOption as any).unwrap() : undefined;

        const unlockingEntries: UnlockingJson[] = ledgerData?.unlocking
          ? (ledgerData.unlocking.map((item: any) => ({
              value: item?.value?.toString(),
              era: item?.era?.toString(),
            })) as UnlockingJson[])
          : [];

        const activeBn = ledgerData?.active
          ? new BigNumber(ledgerData.active.toString())
          : new BigNumber(0);

        const currentEra = currentEraRaw ? new BigNumber(currentEraRaw.toString()) : undefined;

        let totalUnlockingPlanck = new BigNumber(0);
        let totalUnlockingReef = new BigNumber(0);
        let totalRedeemable = new BigNumber(0);

        unlockingEntries.forEach((item) => {
          const valuePlanck = item?.value ? new BigNumber(item.value) : new BigNumber(0);
          const valueReef = valuePlanck.dividedBy(DECIMALS_BIG);
          totalUnlockingPlanck = totalUnlockingPlanck.plus(valuePlanck);
          totalUnlockingReef = totalUnlockingReef.plus(valueReef);

          if (currentEra && item?.era) {
            const era = new BigNumber(item.era);
            if (era.lte(currentEra)) {
              totalRedeemable = totalRedeemable.plus(valueReef);
            }
          }
        });

        const totalLockedPlanck = activeBn.plus(totalUnlockingPlanck);

        if (isMounted) {
          setUnbondingInitiated(unlockingEntries.length > 0);
          setUnbondingAmount(totalUnlockingReef);
          setRedeemableBalance(totalRedeemable);
          setStakedBalance(totalLockedPlanck.dividedBy(DECIMALS_BIG));
        }
      } catch (error) {
        if (!isMounted) return;
        setUnbondingInitiated(false);
        setUnbondingAmount(new BigNumber(0));
        setRedeemableBalance(new BigNumber(0));
      }
    })();

    (async () => {
      try {
        await web3Enable('reef-app');
        const injector = await web3FromSource('polkadot-js');
        api.setSigner(injector.signer);
      } catch (e) {
        // ignore
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [isOpen, api, accountAddress, selectedSigner]);

  const hasUnbonding = unbondingAmount.isGreaterThan(0);

  useEffect(() => {
    if (tab === 'rebond' && !hasUnbonding) {
      setTab('bond');
      setRebondAmount(0);
    }
  }, [tab, hasUnbonding]);

  const sendTx = async (extrinsic: any, success: string, error: string): Promise<void> => {
    try {
      setLoading(true);
      await extrinsic.signAndSend(accountAddress, ({ status }: any) => {
        if (status.isInBlock || status.isFinalized) {
          Uik.notify.success(success);
          setLoading(false);
          onClose();
        }
      });
    } catch (e) {
      setLoading(false);
      Uik.notify.danger(error);
    }
  };

  const toPlanck = (amount: number): BN => {
    const normalized = new BigNumber(amount);
    if (!normalized.isFinite() || normalized.isNegative()) {
      return new BN(0);
    }
    const planck = normalized.multipliedBy(DECIMALS_BIG).integerValue(BigNumber.ROUND_FLOOR);
    return bnToBn(planck.toFixed(0));
  };

  const handleBond = (): void => {
    const valueBN = toPlanck(bondAmount);
    const bondExtrinsic = (api.tx.staking.bond as unknown as (
      controller: string,
      value: BN,
      payee: any
    ) => any)(accountAddress, valueBN, 'Staked');
    sendTx(
      bondExtrinsic,
      strings.staking_bond_success,
      strings.staking_bond_error,
    );
  };

  const handleStake = (): void => {
    const valueBN = toPlanck(stakeAmount);
    sendTx(
      api.tx.staking.bondExtra(valueBN),
      strings.staking_bond_success,
      strings.staking_bond_error,
    );
  };

  const handleUnbond = (): void => {
    const valueBN = toPlanck(bondAmount);
    sendTx(
      api.tx.staking.unbond(valueBN),
      strings.staking_unbond_success,
      strings.staking_unbond_error,
    );
  };

  const handleRebond = (): void => {
    const valueBN = toPlanck(rebondAmount);
    sendTx(
      api.tx.staking.rebond(valueBN),
      strings.staking_rebond_success,
      strings.staking_rebond_error,
    );
  };

  const handleWithdraw = (): void => {
    sendTx(
      api.tx.staking.withdrawUnbonded(0),
      strings.staking_withdraw_success,
      strings.staking_withdraw_error,
    );
  };


  const handleChill = (): void => {
    sendTx(
      api.tx.staking.chill(),
      strings.staking_chill_success,
      strings.staking_chill_error,
    );
  };

  const feeReserve = 10;
  const bondAvailable = Math.max(0, availableBalance.toNumber());
  const bondLocked = Math.max(0, activeStake.toNumber());
  const stakingMaxValue = Math.max(0, availableBalance.minus(feeReserve).toNumber());
  const tabOptions = [
    { value: 'bond', text: strings.staking_bond_unbond },
    ...(hasUnbonding ? [{ value: 'rebond', text: strings.staking_rebond }] : []),
    { value: 'staking', text: strings.staking_tab },
    { value: 'chill', text: strings.staking_chill },
  ];

  return (
    <OverlayAction isOpen={isOpen} onClose={onClose} title={strings.staking_bond_unbond} className="overlay-swap">
      <div className="uik-pool-actions pool-actions">
        <Uik.Tabs
          value={tab}
          onChange={(v: string) => {
            setTab(v as 'bond' | 'rebond' | 'staking' | 'chill');
            setBondAmount(0);
            setRebondAmount(0);
            setStakeAmount(0);
          }}
          options={tabOptions}
        />
        {tab === 'bond' && (
          <BondTab
            bondAmount={bondAmount}
            setBondAmount={setBondAmount}
            availableAmount={bondAvailable}
            activeStake={bondLocked}
            unbondingAmount={unbondingAmount}
            stakeNumber={stakeNumber}
            loading={loading}
            handleBond={handleBond}
            handleUnbond={handleUnbond}
            redeemableBalance={redeemableBalance}
            unbondingInitiated={unbondingInitiated}
            handleWithdraw={handleWithdraw}
          />
        )}
        {tab === 'rebond' && hasUnbonding && (
          <RebondTab
            rebondAmount={rebondAmount}
            setRebondAmount={setRebondAmount}
            unbondingAmount={unbondingAmount}
            loading={loading}
            handleRebond={handleRebond}
            redeemableBalance={redeemableBalance}
            handleWithdraw={handleWithdraw}
          />
        )}
        {tab === 'staking' && (
          <StakingTab
            stakeAmount={stakeAmount}
            setStakeAmount={setStakeAmount}
            stakingMaxValue={stakingMaxValue}
            loading={loading}
            handleStake={handleStake}
          />
        )}
        {tab === 'chill' && (
          <ChillTab
            stakeNumber={stakeNumber}
            loading={loading}
            handleChill={handleChill}
          />
        )}
      </div>
    </OverlayAction>
  );
}
