import React, { useEffect, useState } from 'react';
import Uik from '@reef-chain/ui-kit';
import { ApiPromise } from '@polkadot/api';
import BN from 'bn.js';
import { bnToBn } from '@polkadot/util';
import { extension as reefExt } from '@reef-chain/util-lib';
import SliderWithLabel from './SliderWithLabel';
import { localizedStrings as strings } from '../../l10n/l10n';

const { web3Enable, web3FromSource } = reefExt;
const DECIMALS = new BN(10).pow(new BN(18));

interface Props {
  isOpen: boolean;
  onClose(): void;
  api: ApiPromise;
  accountAddress: string;
}

export default function BondModal({ isOpen, onClose, api, accountAddress }: Props): JSX.Element {
  const [tab, setTab] = useState<'bond' | 'unbond' | 'chill'>('bond');
  const [availableBalance, setAvailableBalance] = useState<BN>(new BN(0));
  const [stakedBalance, setStakedBalance] = useState<BN>(new BN(0));
  const [bondAmount, setBondAmount] = useState(0);
  const [unbondAmount, setUnbondAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    let unsubBalance: () => void;

    api.query.system
      .account(accountAddress, (acc) => {
        const free = new BN((acc.data as any).free.toString());
        setAvailableBalance(free.div(DECIMALS));
      })
      .then((unsub) => {
        unsubBalance = unsub;
      })
      .catch(() => {});

    api.derive.staking
      .account(accountAddress)
      .then((info: any) => {
        const active = new BN(info.stakingLedger?.active?.toString() || '0');
        setStakedBalance(active.div(DECIMALS));
      })
      .catch(() => {});

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
      if (unsubBalance) unsubBalance();
    };
  }, [isOpen, api, accountAddress]);

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

  const handleUnbond = (): void => {
    const valueBN = bnToBn(unbondAmount).mul(DECIMALS);
    sendTx(
      api.tx.staking.unbond(valueBN),
      strings.staking_unbond_success,
      strings.staking_unbond_error,
    );
  };

  const handleChill = (): void => {
    sendTx(
      api.tx.staking.chill(),
      strings.staking_chill_success,
      strings.staking_chill_error,
    );
  };

  return (
    <Uik.Modal isOpen={isOpen} onClose={onClose} title={strings.staking_bond_unbond}>
      <Uik.Tabs
        value={tab}
        onChange={(v: string) => setTab(v as 'bond' | 'unbond' | 'chill')}
        options={[
          { value: 'bond', text: strings.staking_bond },
          { value: 'unbond', text: strings.staking_unbond },
          { value: 'chill', text: strings.staking_chill },
        ]}
      />

      {tab === 'bond' && (
        <div className="flex flex-col gap-6">
          <Uik.ReefAmount value={availableBalance.toString()} />
          <Uik.Card>
            <SliderWithLabel
              value={bondAmount}
              max={availableBalance.toNumber()}
              onChange={(v: number) => setBondAmount(v)}
            />
          </Uik.Card>
          <Uik.Card>
            <Uik.Button
              success
              text={strings.staking_bond}
              loading={loading}
              disabled={!stakedBalance.isZero()}
              onClick={handleBond}
            />
          </Uik.Card>
        </div>
      )}

      {tab === 'unbond' && (
        <div className="flex flex-col gap-6">
          <Uik.ReefAmount value={stakedBalance.toString()} />
          <Uik.Card>
            <SliderWithLabel
              value={unbondAmount}
              max={stakedBalance.toNumber()}
              onChange={(v: number) => setUnbondAmount(v)}
            />
          </Uik.Card>
          <Uik.Card>
            <Uik.Button
              success
              text={strings.staking_unbond}
              loading={loading}
              disabled={stakedBalance.isZero()}
              onClick={handleUnbond}
            />
          </Uik.Card>
        </div>
      )}

      {tab === 'chill' && (
        <div className="flex flex-col gap-6">
          <Uik.ReefAmount value={stakedBalance.toString()} />
          <Uik.Card>
            <Uik.Button
              danger
              text={strings.staking_chill}
              loading={loading}
              onClick={handleChill}
            />
          </Uik.Card>
        </div>
      )}
    </Uik.Modal>
  );
}
