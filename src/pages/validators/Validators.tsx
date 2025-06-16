import React, { useEffect, useState, useContext } from 'react';
import Uik from '@reef-chain/ui-kit';
import { ApiPromise } from '@polkadot/api';
import BN from 'bn.js';
import { utils } from '@reef-chain/react-lib';
import { utils as ethUtils } from 'ethers';
import { useHistory } from 'react-router-dom';
import TokenPricesContext from '../../context/TokenPricesContext';
import ReefSigners from '../../context/ReefSigners';
import { VALIDATORS_URL } from '../../urls';
import { localizedStrings as strings } from '../../l10n/l10n';
import { formatReefAmount } from '../../utils/formatReefAmount';
import { shortAddress, toCurrencyFormat } from '../../utils/utils';
import './validators.css';
import StakingActions from './StakingActions';
import {
  loadValidators,
  saveValidators,
  loadCachedValidators,
  CACHE_ACTIVE_KEY,
  CachedValidator,
} from '../../utils/validatorsCache';
import calculateStakingAPY from '../../utils/calculateStakingAPY';

type ValidatorInfo = CachedValidator;

const AVATAR_COUNT = 36;

const avatarFor = (address: string): string => {
  const sum = address
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const index = (sum % AVATAR_COUNT) + 1;
  return `/images/avatars/${index}.png`;
};

const Validators = (): JSX.Element => {
  const { provider, selectedSigner } = useContext(ReefSigners);
  const tokenPrices = useContext(TokenPricesContext);
  const { REEF_ADDRESS } = utils;
  const history = useHistory();
  const [tab, setTab] = useState<'active' | 'actions'>('active');
  const [validators, setValidators] = useState<ValidatorInfo[]>(() => {
    try {
      const cached = loadCachedValidators(CACHE_ACTIVE_KEY) as ValidatorInfo[] | null;
      return cached || [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [nominations, setNominations] = useState<string[]>([]);
  const [nominatorStake, setNominatorStake] = useState<string>('0');
  const stakeNumber = Number(ethUtils.formatUnits(nominatorStake || '0', 18));
  const stakeUsd = stakeNumber * (tokenPrices[REEF_ADDRESS] || 0);
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const TOTAL_POINTS_TARGET = 172800;
  const INFLATION_RATE = 0.0468;
  const [sortBy, setSortBy] = useState<'commission' | 'minRequired' | 'apy' | null>(null);
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  const toggleSort = (column: 'commission' | 'minRequired' | 'apy'): void => {
    if (sortBy === column) {
      setSortDir(sortDir === 1 ? -1 : 1);
    } else {
      setSortBy(column);
      setSortDir(1);
    }
  };

  const getAPY = (v: ValidatorInfo): number => {
    const bonded = Number(ethUtils.formatUnits(v.totalBonded, 18));
    const commissionRate = Number(v.commission) / 1000000000;
    const avgPoints = validators.length ? TOTAL_POINTS_TARGET / validators.length : 0;
    const apy = calculateStakingAPY(
      1,
      bonded,
      commissionRate,
      avgPoints,
      TOTAL_POINTS_TARGET,
      INFLATION_RATE,
      totalSupply,
    );
    return apy;
  };

  const sortedValidators = React.useMemo(() => {
    const vals = [...validators];
    if (!sortBy) return vals;
    vals.sort((a, b) => {
      if (sortBy === 'commission') {
        const aVal = Number(a.commission);
        const bVal = Number(b.commission);
        return (aVal - bVal) * sortDir;
      }
      if (sortBy === 'minRequired') {
        const aVal = new BN(a.minRequired);
        const bVal = new BN(b.minRequired);
        if (aVal.eq(bVal)) return 0;
        return (aVal.gt(bVal) ? 1 : -1) * sortDir;
      }
      if (sortBy === 'apy') {
        const aVal = getAPY(a);
        const bVal = getAPY(b);
        if (aVal === bVal) return 0;
        return (aVal > bVal ? 1 : -1) * sortDir;
      }
      return 0;
    });
    return vals;
  }, [validators, sortBy, sortDir, totalSupply]);

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (!provider?.api || tab === 'actions') return;
      const api = provider.api as ApiPromise;
      try {
        setLoading(true);
        // overview provides active and next elected validator addresses
        const overview: any = await api.derive.staking.overview();
        const era = overview.activeEra?.toString() || `${overview.activeEra}`;
        const cacheKey = CACHE_ACTIVE_KEY;
        const cached = loadValidators(cacheKey, era) as ValidatorInfo[] | null;
        if (cached) {
          setValidators(cached);
          setLoading(false);
          return;
        }
        const addresses: string[] = overview.validators;
        const vals: ValidatorInfo[] = [];
        for (const addr of addresses) {
          const [info, exposure, prefs] = await Promise.all([
            api.derive.accounts.info(addr),
            api.query.staking.erasStakers(overview.activeEra as any, addr),
            api.query.staking.validators(addr),
          ]);
          let identity = '';
          if (info.identity) {
            const parent = (info.identity as any).displayParent;
            const { display } = info.identity;
            if (parent) {
              identity = `${parent}/${display}`;
            } else if (display) {
              identity = display;
            }
          }
          const others = (exposure as any)?.others || [];
          let minRequired = '0';
          if (others.length) {
            const sorted = others
              .map((o: any) => new BN(o.value?.toString() || '0'))
              .sort((a, b) => b.cmp(a));
            const top = sorted.slice(0, 64);
            const last = top[top.length - 1];
            if (last) {
              minRequired = last.toString();
            }
          }
          vals.push({
            address: addr,
            identity,
            totalBonded: (exposure as any)?.total?.toString() || '0',
            commission: prefs?.commission?.toString() || '0',
            isActive: overview.validators.includes(addr),
            minRequired,
          });
        }
        setValidators(vals);
        saveValidators(cacheKey, era, vals);
        setLoading(false);
      } catch (e) {
        console.warn('Error loading validators', e);
        setLoading(false);
      }
    };
    load();
  }, [provider, tab]);

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
    const loadSupply = async (): Promise<void> => {
      if (!provider?.api) return;
      const api = provider.api as ApiPromise;
      try {
        const issuance = await api.query.balances.totalIssuance();
        setTotalSupply(Number(ethUtils.formatUnits(issuance.toString(), 18)));
      } catch (e) {
        console.warn('Error loading total supply', e);
      }
    };
    loadSupply();
  }, [provider]);

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


  return (
    <div className="validators-page">
      <Uik.Text type="headline" className="validators-page__title">
        {strings.validators}
      </Uik.Text>
      <div className="validators-page__filter">
        <Uik.Tabs
          value={tab}
          onChange={(val) => {
            const t = val as 'active' | 'actions';
            setTab(t);
            if (t === 'active') history.push(VALIDATORS_URL);
          }}
          options={[
            { value: 'active', text: 'Active' },
            { value: 'actions', text: 'Actions' },
          ]}
        />
      </div>
      {tab === 'actions' && selectedSigner && (
        <div className="validators-page__stake">
          <Uik.Text type="title">
            {strings.your_stake}
            :
            {formatReefAmount(new BN(nominatorStake))}
          </Uik.Text>
          <Uik.Text type="title">
            {toCurrencyFormat(stakeUsd, { maximumFractionDigits: 2 })}
          </Uik.Text>
        </div>
      )}
      {tab === 'actions' && selectedSigner && (
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
      {tab === 'actions' && (
        <StakingActions validators={validators} />
      )}
      {tab !== 'actions' && (
      <Uik.Table seamless>
        <Uik.THead>
          <Uik.Tr>
            <Uik.Th>{strings.account}</Uik.Th>
            <Uik.Th>{strings.total_staked}</Uik.Th>
            <Uik.Th>
              <span
                className="validators-page__sortable"
                onClick={() => toggleSort('minRequired')}
              >
                {strings.min_required}
                {sortBy === 'minRequired' && (sortDir === 1 ? ' ▲' : ' ▼')}
              </span>
            </Uik.Th>
            <Uik.Th>
              <span
                className="validators-page__sortable"
                onClick={() => toggleSort('commission')}
              >
                Commission
                {sortBy === 'commission' && (sortDir === 1 ? ' ▲' : ' ▼')}
              </span>
            </Uik.Th>
            <Uik.Th>
              <span
                className="validators-page__sortable"
                onClick={() => toggleSort('apy')}
              >
                APY
                {sortBy === 'apy' && (sortDir === 1 ? ' ▲' : ' ▼')}
              </span>
            </Uik.Th>
            <Uik.Th />
          </Uik.Tr>
        </Uik.THead>
        <Uik.TBody>
          {loading && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center' }}>
                <Uik.Loading text="Loading" />
              </td>
            </tr>
          )}
          {sortedValidators.map((v) => (
            <Uik.Tr key={v.address}>
              <Uik.Td>
                <div className="validators-page__id">
                  <Uik.Avatar image={avatarFor(v.address)} size="small" />
                  {v.identity ? v.identity : shortAddress(v.address)}
                </div>
              </Uik.Td>
              <Uik.Td>
                {formatReefAmount(new BN(v.totalBonded))}
              </Uik.Td>
              <Uik.Td>
                {formatReefAmount(new BN(v.minRequired))}
              </Uik.Td>
              <Uik.Td>
                {(Number(v.commission) / 10000000).toFixed(2)}%
              </Uik.Td>
              <Uik.Td>
                {`${(getAPY(v) * 100).toFixed(2)}%`}
              </Uik.Td>
              <Uik.Td />
            </Uik.Tr>
          ))}
        </Uik.TBody>
      </Uik.Table>
      )}
    </div>
  );
};

export default Validators;
