import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Components } from '@reef-chain/react-lib';
import Uik from '@reef-chain/ui-kit';
import { ApiPromise } from '@polkadot/api';
import BN from 'bn.js';
import BigNumber from 'bignumber.js';
import { bnToBn } from '@polkadot/util';
import { extension as reefExt } from '@reef-chain/util-lib';
import BondTab from './tabs/BondTab';
import StakingTab from './tabs/StakingTab';
import ChillTab from './tabs/ChillTab';
import './bond-action.css';
import { localizedStrings as strings } from '../../l10n/l10n';
import ReefSigners from '../../context/ReefSigners';

const { OverlayAction } = Components;
const { web3Enable, web3FromSource } = reefExt;
const DECIMALS = new BN(10).pow(new BN(18));
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
  const [tab, setTab] = useState<'bond' | 'staking' | 'chill'>('bond');
  const [availableBalance, setAvailableBalance] = useState<BN>(new BN(0));
  const [stakedBalance, setStakedBalance] = useState<BN>(new BN(0));
  const [redeemableBalance, setRedeemableBalance] = useState<BN>(new BN(0));
  const [unbondingInitiated, setUnbondingInitiated] = useState(false);
  const [unbondingAmount, setUnbondingAmount] = useState<BigNumber>(new BigNumber(0));
  const [bondAmount, setBondAmount] = useState(0);
  const [stakeAmount, setStakeAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const activeStake = useMemo(
    () => new BigNumber(stakedBalance.toString()).minus(unbondingAmount),
    [stakedBalance, unbondingAmount],
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    setBondAmount(0);
    setStakeAmount(0);

    if (selectedSigner) {
      setAvailableBalance(new BN(selectedSigner.freeBalance.toString()).div(DECIMALS));
      setStakedBalance(new BN(selectedSigner.lockedBalance.toString()).div(DECIMALS));
    }

    api.query.staking
      .ledger(accountAddress)
      .then((ledger: any) => {
        const data = ledger?.toJSON();
        const unlocking = data?.unlocking;
        setUnbondingInitiated(Array.isArray(unlocking) && unlocking.length > 0);
        setRedeemableBalance(new BN(data?.redeemable || '0').div(DECIMALS));
        if (Array.isArray(unlocking)) {
          const total = unlocking.reduce(
            (acc: BigNumber, item: any) =>
              acc.plus(new BigNumber(item?.value || 0).dividedBy(DECIMALS_BIG)),
            new BigNumber(0),
          );
          setUnbondingAmount(total);
        } else {
          setUnbondingAmount(new BigNumber(0));
        }
      })
      .catch(() => {
        setUnbondingInitiated(false);
        setUnbondingAmount(new BigNumber(0));
      });
    (async () => {
      try {
        await web3Enable('reef-app');
        const injector = await web3FromSource('polkadot-js');
        api.setSigner(injector.signer);
      } catch (e) {
        // ignore
      }
    })();

    return undefined;
  }, [isOpen, api, accountAddress, selectedSigner]);

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

  const handleBond = (): void => {
    const valueBN = bnToBn(bondAmount).mul(DECIMALS);
    sendTx(
      api.tx.staking.bond(valueBN, 'Staked'),
      strings.staking_bond_success,
      strings.staking_bond_error,
    );
  };

  const handleStake = (): void => {
    const valueBN = bnToBn(stakeAmount).mul(DECIMALS);
    sendTx(
      api.tx.staking.bondExtra(valueBN),
      strings.staking_bond_success,
      strings.staking_bond_error,
    );
  };

  const handleUnbond = (): void => {
    const valueBN = bnToBn(bondAmount).mul(DECIMALS);
    sendTx(
      api.tx.staking.unbond(valueBN),
      strings.staking_unbond_success,
      strings.staking_unbond_error,
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
  const bondAvailable = availableBalance.toNumber();
  const bondLocked = activeStake.toNumber();
  const stakingMaxValue = Math.max(0, availableBalance.toNumber() - feeReserve);

  return (
    <OverlayAction isOpen={isOpen} onClose={onClose} title={strings.staking_bond_unbond} className="overlay-swap">
      <div className="uik-pool-actions pool-actions">
        <Uik.Tabs
          value={tab}
          onChange={(v: string) => {
            setTab(v as 'bond' | 'staking' | 'chill');
            setBondAmount(0);
            setStakeAmount(0);
          }}
          options={[
            { value: 'bond', text: strings.staking_bond_unbond },
            { value: 'staking', text: strings.staking_tab },
            { value: 'chill', text: strings.staking_chill },
          ]}
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
