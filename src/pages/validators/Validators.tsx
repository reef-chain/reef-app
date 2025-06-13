import React, { useEffect, useState, useContext } from 'react';
import Uik from '@reef-chain/ui-kit';
import { ApiPromise } from '@polkadot/api';
import BN from 'bn.js';
import ReefSigners from '../../context/ReefSigners';
import { localizedStrings as strings } from '../../l10n/l10n';
import { formatReefAmount } from '../../utils/formatReefAmount';
import './validators.css';

interface ValidatorInfo {
  address: string;
  identity?: string;
  totalBonded: string;
  commission: string;
  isActive: boolean;
}

const Validators = (): JSX.Element => {
  const { provider, selectedSigner } = useContext(ReefSigners);
  const [filter, setFilter] = useState<'active' | 'waiting'>('active');
  const [validators, setValidators] = useState<ValidatorInfo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [nominations, setNominations] = useState<string[]>([]);
  const [nominatorStake, setNominatorStake] = useState<string>('0');

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (!provider?.api) return;
      const api = provider.api as ApiPromise;
      try {
        // overview provides active and next elected validator addresses
        const overview: any = await api.derive.staking.overview();
        const waiting: string[] = overview.nextElected.filter((a: string) => !overview.validators.includes(a));
        const addresses: string[] = filter === 'active' ? overview.validators : waiting;
        const vals: ValidatorInfo[] = [];
        for (const addr of addresses) {
          const [info, exposure, prefs] = await Promise.all([
            api.derive.accounts.info(addr),
            api.query.staking.erasStakers(overview.activeEra as any, addr),
            api.query.staking.validators(addr),
          ]);
          vals.push({
            address: addr,
            identity: info.identity?.display || '',
            totalBonded: (exposure as any)?.total?.toString() || '0',
            commission: prefs?.commission?.toString() || '0',
            isActive: overview.validators.includes(addr),
          });
        }
        setValidators(vals);
      } catch (e) {
        console.warn('Error loading validators', e);
      }
    };
    load();
  }, [provider, filter]);

  useEffect(() => {
    const loadNominations = async (): Promise<void> => {
      if (!provider?.api || !selectedSigner) {
        setNominations([]);
        return;
      }
      const api = provider.api as ApiPromise;
      try {
        const nominators = await api.query.staking.nominators(selectedSigner.address);
        if ((nominators as any)?.isSome) {
          const targets = (nominators as any).unwrap().targets as any;
          setNominations(targets.map((t: any) => t.toString()));
        } else {
          setNominations([]);
        }
      } catch (e) {
        console.warn('Error loading nominations', e);
        setNominations([]);
      }
    };
    loadNominations();
  }, [provider, selectedSigner]);

  useEffect(() => {
    const loadStake = async (): Promise<void> => {
      if (!provider?.api || !selectedSigner) {
        setNominatorStake('0');
        return;
      }
      const api = provider.api as ApiPromise;
      try {
        const stakingInfo: any = await api.derive.staking.account(selectedSigner.address);
        const active = stakingInfo?.stakingLedger?.active as BN | undefined;
        setNominatorStake(active ? active.toString() : '0');
      } catch (e) {
        console.warn('Error loading nominator stake', e);
        setNominatorStake('0');
      }
    };
    loadStake();
  }, [provider, selectedSigner]);

  const toggleSelect = (addr: string): void => {
    setSelected((prev) => {
      const exists = prev.includes(addr);
      if (exists) return prev.filter((a) => a !== addr);
      if (prev.length >= 16) return prev;
      return [...prev, addr];
    });
  };


  return (
    <div className="validators-page">
      <Uik.Text type="headline" className="validators-page__title">
        {strings.validators}
      </Uik.Text>
      <div className="validators-page__filter">
        <Uik.Button
          text="Active"
          fill={filter === 'active'}
          onClick={() => setFilter('active')}
        />
        <Uik.Button
          text="Waiting"
          fill={filter === 'waiting'}
          onClick={() => setFilter('waiting')}
        />
      </div>
      {selectedSigner && (
        <div className="validators-page__stake">
          <Uik.Text type="title">
            {strings.your_stake}
            :
            {formatReefAmount(new BN(nominatorStake))}
          </Uik.Text>
        </div>
      )}
      {selectedSigner && (
        <div className="validators-page__nominations">
          <Uik.Text type="title">{strings.current_nominations}</Uik.Text>
          {nominations.length ? (
            <ul className="validators-page__nominations-list">
              {nominations.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          ) : (
            <Uik.Text>{strings.no_nominations}</Uik.Text>
          )}
        </div>
      )}
      <Uik.Table seamless>
        <Uik.THead>
          <Uik.Tr>
            <Uik.Th />
            <Uik.Th>{strings.account}</Uik.Th>
            <Uik.Th>{strings.total_staked}</Uik.Th>
            <Uik.Th>Commission</Uik.Th>
            <Uik.Th />
          </Uik.Tr>
        </Uik.THead>
        <Uik.TBody>
          {validators.map((v) => (
            <Uik.Tr key={v.address}>
              <Uik.Td>
                <input
                  type="checkbox"
                  checked={selected.includes(v.address)}
                  onChange={() => toggleSelect(v.address)}
                />
              </Uik.Td>
              <Uik.Td>
                <div className="validators-page__id">
                  {v.identity || v.address}
                </div>
              </Uik.Td>
              <Uik.Td>
                {formatReefAmount(new BN(v.totalBonded))}
              </Uik.Td>
              <Uik.Td>
                {(Number(v.commission) / 10000000).toFixed(2)}
                %
              </Uik.Td>
              <Uik.Td />
            </Uik.Tr>
          ))}
        </Uik.TBody>
      </Uik.Table>
    </div>
  );
};

export default Validators;
