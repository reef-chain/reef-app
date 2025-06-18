import React, { useEffect, useState } from 'react';
import { Components } from '@reef-chain/react-lib';
import Uik from '@reef-chain/ui-kit';
import { ApiPromise } from '@polkadot/api';
import BN from 'bn.js';
import { bnToBn } from '@polkadot/util';
import { extension as reefExt } from '@reef-chain/util-lib';
import PercentSlider from './PercentSlider';
import './bond-action.css';
import { localizedStrings as strings } from '../../l10n/l10n';

const { OverlayAction } = Components;
const { web3Enable, web3FromSource } = reefExt;
const DECIMALS = new BN(10).pow(new BN(18));

interface Props {
  isOpen: boolean;
  onClose(): void;
  api: ApiPromise;
  accountAddress: string;
  stakeNumber: number;
}

export default function BondActionModal({ isOpen, onClose, api, accountAddress, stakeNumber }: Props): JSX.Element {
  const [tab, setTab] = useState<'bond' | 'chill'>('bond');
  const [availableBalance, setAvailableBalance] = useState<BN>(new BN(0));
  const [stakedBalance, setStakedBalance] = useState<BN>(new BN(0));
  const [amount, setAmount] = useState(0);
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
    const valueBN = bnToBn(amount).mul(DECIMALS);
    sendTx(
      api.tx.staking.bond(valueBN, 'Staked'),
      strings.staking_bond_success,
      strings.staking_bond_error,
    );
  };

  const handleUnbond = (): void => {
    const valueBN = bnToBn(amount).mul(DECIMALS);
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

  const maxValue = stakeNumber > 0 ? stakedBalance.toNumber() : availableBalance.toNumber();

  return (
    <OverlayAction isOpen={isOpen} onClose={onClose} title={strings.staking_bond_unbond} className="overlay-swap">
      <div className="uik-pool-actions pool-actions">
        <Uik.Tabs
          value={tab}
          onChange={(v: string) => { setTab(v as 'bond' | 'chill'); setAmount(0); }}
          options={[
            { value: 'bond', text: strings.staking_bond_unbond },
            { value: 'chill', text: strings.staking_chill },
          ]}
        />
        <div className="bond-action-wrapper">
          <Uik.Card className="bond-action-card">
            <div className="uik-pool-actions-token">
              <div className="uik-pool-actions-token__token">
                <div className="uik-pool-actions-token__select-wrapper">
                  <Uik.ReefIcon />
                  <span>REEF</span>
                </div>
                {tab !== 'chill' && (
                  <div className="uik-pool-actions-token__value">
                    <Uik.Input
                      type="number"
                      value={amount.toString()}
                      min={0}
                      max={maxValue}
                      onInput={(e) =>
                        setAmount(Number((e.target as HTMLInputElement).value))
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </Uik.Card>

          {tab !== 'chill' && (
            <Uik.Card className="bond-action-card">
              <PercentSlider max={maxValue} value={amount} onChange={setAmount} />
            </Uik.Card>
          )}

          <Uik.Card className="bond-action-card bond-action-card-button">
            {tab === 'bond' && (
              <Uik.Button
                success
                text={stakeNumber === 0 ? strings.staking_bond : strings.staking_unbond}
                loading={loading}
                onClick={stakeNumber === 0 ? handleBond : handleUnbond}
              />
            )}
            {tab === 'chill' && (
              <Uik.Button
                danger
                text={strings.staking_chill}
                loading={loading}
                disabled={stakeNumber === 0}
                onClick={handleChill}
              />
            )}
          </Uik.Card>
        </div>
      </div>
    </OverlayAction>
  );
}
