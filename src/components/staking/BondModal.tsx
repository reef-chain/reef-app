import React, { useEffect, useState } from 'react';
import Uik from '@reef-chain/ui-kit';
import { ApiPromise } from '@polkadot/api';
import BN from 'bn.js';
import { bnToBn } from '@polkadot/util';
import { extension as reefExt } from '@reef-chain/util-lib';
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
  const [available, setAvailable] = useState<BN>(new BN(0));
  const [staked, setStaked] = useState<BN>(new BN(0));
  const [bondAmt, setBondAmt] = useState(0);
  const [unbondAmt, setUnbondAmt] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    let unsubBalance: () => void;

    api.query.system
      .account(accountAddress, (acc) => {
        setAvailable(new BN((acc.data as any).free.toString()));
      })
      .then((unsub) => {
        unsubBalance = unsub;
      })
      .catch(() => {});

    api.derive.staking
      .account(accountAddress)
      .then((info: any) => {
        setStaked(info.stakingLedger?.active || bnToBn(0));
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
          Uik.Toast.success(success);
          setLoading(false);
          onClose();
        }
      });
    } catch (e) {
      setLoading(false);
      Uik.Toast.error(error);
    }
  };

  const onBond = (): void => {
    const value = bnToBn(bondAmt).mul(DECIMALS);

    sendTx(
      api.tx.staking.bond(
        value,
        'Staked',
      ),
      strings.staking_bond_success,
      strings.staking_bond_error,
    );
  };

  const handleUnbond = (): void => {
    const value = bnToBn(unbondAmt).mul(DECIMALS);
    sendTx(
      api.tx.staking.unbond(value),
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
    <Uik.ActionModal isOpen={isOpen} onClose={onClose} title={strings.staking_bond_unbond}>
      <Uik.Tabs
        current={tab}
        onChange={(id: string) => setTab(id as 'bond' | 'unbond' | 'chill')}
        items={[
          { id: 'bond', text: strings.staking_bond },
          { id: 'unbond', text: strings.staking_unbond },
          { id: 'chill', text: strings.staking_chill },
        ]}
      />

      {tab === 'bond' && (
        <div className="flex flex-col gap-6">
          <Uik.Card>
            <Uik.PoolActionsToken />
          </Uik.Card>
          <Uik.Card>
            <Uik.Slider
              min={0}
              max={(available ?? new BN(0)).toNumber()}
              value={bondAmt}
              onChange={(v: number) => setBondAmt(v)}
              labelFormatter={(v: number) => `${v} REEF`}
            />
          </Uik.Card>
          <Uik.Card flat>
            <Uik.Button
              primary
              text={strings.staking_bond}
              loading={loading}
              disabled={(available ?? new BN(0)).isZero()}
              onClick={onBond}
            />
          </Uik.Card>
        </div>
      )}

      {tab === 'unbond' && (
        <div className="flex flex-col gap-6">
          <Uik.Card>
            <Uik.PoolActionsToken />
          </Uik.Card>
          <Uik.Card>
            <Uik.Slider
              min={0}
              max={(staked ?? new BN(0)).toNumber()}
              value={unbondAmt}
              onChange={(v: number) => setUnbondAmt(v)}
              labelFormatter={(v: number) => `${v} REEF`}
            />
          </Uik.Card>
          <Uik.Card flat>
            <Uik.Button
              primary
              text={strings.staking_unbond}
              loading={loading}
              disabled={(staked ?? new BN(0)).isZero()}
              onClick={handleUnbond}
            />
          </Uik.Card>
        </div>
      )}

      {tab === 'chill' && (
        <div className="flex flex-col gap-6">
          <Uik.Card flat>
            <Uik.Button
              danger
              text={strings.staking_chill}
              loading={loading}
              onClick={handleChill}
            />
          </Uik.Card>
        </div>
      )}
    </Uik.ActionModal>
  );
}
