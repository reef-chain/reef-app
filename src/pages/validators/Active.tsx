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
  ValidatorInfo,
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
        const aVal = a.apy ?? 0;
        const bVal = b.apy ?? 0;
        if (aVal === bVal) return 0;
        return (aVal > bVal ? 1 : -1) * sortDir;
      }
      return 0;
    });
    return vals;
  }, [validators, sortBy, sortDir]);

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
        const issuance = await api.query.balances.totalIssuance();
        const supply = Number(ethUtils.formatUnits(issuance.toString(), 18));
        const cached = loadValidators(cacheKey, era) as ValidatorInfo[] | null;
        if (cached) {
          const avgPointsCached = cached.length ? TOTAL_POINTS_TARGET / cached.length : 0;
          const withApy = cached.map((v) => ({
            ...v,
            apy: calculateStakingAPY(
              1,
              Number(ethUtils.formatUnits(v.totalBonded, 18)),
              Number(v.commission) / 1000000000,
              avgPointsCached,
              TOTAL_POINTS_TARGET,
              INFLATION_RATE,
              supply,
            ),
          }));
          setValidators(withApy);
          setLoading(false);
          return;
        }
        const addresses: string[] = overview.validators.map((a: any) => a.toString());
        const infos = await Promise.all(
          addresses.map((addr) => api.derive.accounts.info(addr)),
        );

        const exposures: any[] = [];
        for (let i = 0; i < addresses.length; i += 50) {
          const chunk = addresses.slice(i, i + 50);
          // eslint-disable-next-line no-await-in-loop
          const res = await api.query.staking.erasStakers.multi(
            chunk.map((addr) => [overview.activeEra as any, addr]),
          );
          exposures.push(...res);
        }

        const prefs: any[] = [];
        for (let i = 0; i < addresses.length; i += 50) {
          const chunk = addresses.slice(i, i + 50);
          // eslint-disable-next-line no-await-in-loop
          const res = await api.query.staking.validators.multi(chunk);
          prefs.push(...res);
        }

        const vals: ValidatorInfo[] = addresses.map((addr, idx) => {
          const info = infos[idx];
          const exposure = exposures[idx];
          const pref = prefs[idx];

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

          return {
            address: addr,
            identity,
            totalBonded: (exposure as any)?.total?.toString() || '0',
            commission: (pref as any)?.commission?.toString() || '0',
            isActive: addresses.includes(addr),
            minRequired,
          };
        });
        const avgPoints = vals.length ? TOTAL_POINTS_TARGET / vals.length : 0;
        const withApy = vals.map((v) => ({
          ...v,
          apy: calculateStakingAPY(
            1,
            Number(ethUtils.formatUnits(v.totalBonded, 18)),
            Number(v.commission) / 1000000000,
            avgPoints,
            TOTAL_POINTS_TARGET,
            INFLATION_RATE,
            supply,
          ),
        }));
        setValidators(withApy);
        saveValidators(cacheKey, era, withApy);
        setLoading(false);
      } catch (e) {
        console.warn('Error loading validators', e);
        setLoading(false);
      }
    };
    load();
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
            <Uik.Td>{`${((v.apy ?? 0) * 100).toFixed(2)}%`}</Uik.Td>
            <Uik.Td />
          </Uik.Tr>
        ))}
      </Uik.TBody>
    </Uik.Table>
  );
};

export default Active;
