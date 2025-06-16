import React, {
  useEffect, useState, useContext, useMemo, useCallback,
} from 'react';
import Uik from '@reef-chain/ui-kit';
import { ApiPromise } from '@polkadot/api';
import BN from 'bn.js';
import { utils as ethUtils } from 'ethers';
import ReefSigners from '../../context/ReefSigners';
import { localizedStrings as strings } from '../../l10n/l10n';
import { formatReefAmount } from '../../utils/formatReefAmount';
import { shortAddress } from '../../utils/utils';
import {
  loadValidators,
  saveValidators,
  loadCachedValidators,
  CACHE_ACTIVE_KEY,
  CachedValidator,
} from '../../utils/validatorsCache';
import calculateStakingAPY from '../../utils/calculateStakingAPY';
import './validators.css';

const avatarContext = (require as any).context(
  '../../../node_modules/@reef-chain/ui-kit/src/ui-kit/assets/avatars',
  false,
  /\.png$/,
);
const AVATARS: string[] = avatarContext
  .keys()
  .map((k: string) => avatarContext(k).default ?? avatarContext(k));

const hashAddress = (addr: string): number => addr.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

type ValidatorInfo = CachedValidator;

const Active: React.FC = () => {
  const { provider } = useContext(ReefSigners);

  const [validators, setValidators] = useState<ValidatorInfo[]>(() => {
    try {
      const cached = loadCachedValidators(CACHE_ACTIVE_KEY) as ValidatorInfo[] | null;
      return cached || [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const TOTAL_POINTS_TARGET = 172800;
  const INFLATION_RATE = 0.0468;
  const [sortBy, setSortBy] = useState<'commission' | 'minRequired' | 'apy' | 'totalBonded' | null>(null);
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  const toggleSort = (column: 'commission' | 'minRequired' | 'apy' | 'totalBonded'): void => {
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

  const sortedValidators = useMemo(() => {
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
      if (sortBy === 'totalBonded') {
        const aVal = new BN(a.totalBonded);
        const bVal = new BN(b.totalBonded);
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

  const avatarMap = useMemo(() => {
    const addresses = [...validators.map((v) => v.address)].sort();
    const used = new Set<number>();
    const map = new Map<string, string>();
    for (const addr of addresses) {
      const base = hashAddress(addr) % AVATARS.length;
      for (let i = 0; i < AVATARS.length; i += 1) {
        const idx = (base + i) % AVATARS.length;
        if (!used.has(idx)) {
          used.add(idx);
          map.set(addr, AVATARS[idx]);
          break;
        }
      }
    }
    return map;
  }, [validators]);

  const avatarFor = useCallback(
    (address: string): string => avatarMap.get(address) ?? AVATARS[0],
    [avatarMap],
  );

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (!provider?.api) return;
      const api = provider.api as ApiPromise;
      try {
        setLoading(true);
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
  }, [provider]);

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

  return (
    <Uik.Table seamless>
      <Uik.THead>
        <Uik.Tr>
          <Uik.Th>{strings.account}</Uik.Th>
          <Uik.Th>
            <span className="validators-page__sortable" onClick={() => toggleSort('totalBonded')}>
              {strings.total_staked}
              {sortBy === 'totalBonded' && (sortDir === 1 ? ' \u25B2' : ' \u25BC')}
            </span>
          </Uik.Th>
          <Uik.Th>
            <span className="validators-page__sortable" onClick={() => toggleSort('minRequired')}>
              {strings.min_required}
              {sortBy === 'minRequired' && (sortDir === 1 ? ' \u25B2' : ' \u25BC')}
            </span>
          </Uik.Th>
          <Uik.Th>
            <span className="validators-page__sortable" onClick={() => toggleSort('commission')}>
              Commission
              {sortBy === 'commission' && (sortDir === 1 ? ' \u25B2' : ' \u25BC')}
            </span>
          </Uik.Th>
          <Uik.Th>
            <span className="validators-page__sortable" onClick={() => toggleSort('apy')}>
              APY
              {sortBy === 'apy' && (sortDir === 1 ? ' \u25B2' : ' \u25BC')}
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
            <Uik.Td>{formatReefAmount(new BN(v.totalBonded))}</Uik.Td>
            <Uik.Td>{formatReefAmount(new BN(v.minRequired))}</Uik.Td>
            <Uik.Td>
              {(Number(v.commission) / 10000000).toFixed(2)}
              %
            </Uik.Td>
            <Uik.Td>{`${(getAPY(v) * 100).toFixed(2)}%`}</Uik.Td>
            <Uik.Td />
          </Uik.Tr>
        ))}
      </Uik.TBody>
    </Uik.Table>
  );
};

export default Active;
