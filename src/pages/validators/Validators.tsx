import React, { useEffect, useState, useContext } from 'react';
import Uik from '@reef-chain/ui-kit';
import { ApiPromise } from '@polkadot/api';
import BN from 'bn.js';
import ReefSigners from '../../context/ReefSigners';
import { localizedStrings as strings } from '../../l10n/l10n';
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

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (!provider?.api) return;
      const api = provider.api as ApiPromise;
      try {
        // overview provides active and waiting validator addresses
        const overview: any = await api.derive.staking.overview();
        const addresses: string[] =
          filter === 'active' ? overview.validators : overview.waiting;
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

  const toggleSelect = (addr: string): void => {
    setSelected((prev) => {
      const exists = prev.includes(addr);
      if (exists) return prev.filter((a) => a !== addr);
      if (prev.length >= 16) return prev;
      return [...prev, addr];
    });
  };

  const bond = async (address: string): Promise<void> => {
    if (!provider?.api || !selectedSigner) return;
    const api = provider.api as ApiPromise;
    await api.tx.staking
      .nominate([address])
      .signAndSend(selectedSigner.address, { signer: selectedSigner.signer });
  };

  const unbond = async (): Promise<void> => {
    if (!provider?.api || !selectedSigner) return;
    const api = provider.api as ApiPromise;
    await api.tx.staking
      .unbond(new BN(0))
      .signAndSend(selectedSigner.address, { signer: selectedSigner.signer });
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
            <Uik.Th>{strings.balance}</Uik.Th>
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
              <Uik.Td>{v.totalBonded}</Uik.Td>
              <Uik.Td>{v.commission}</Uik.Td>
              <Uik.Td>
                <Uik.Button size="small" text={strings.bond} onClick={() => bond(v.address)} />
                <Uik.Button size="small" text={strings.unbond} onClick={unbond} />
              </Uik.Td>
            </Uik.Tr>
          ))}
        </Uik.TBody>
      </Uik.Table>
    </div>
  );
};

export default Validators;
