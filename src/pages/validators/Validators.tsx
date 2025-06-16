import React, { useEffect, useState, useContext, useMemo } from 'react';
import Uik from '@reef-chain/ui-kit';
import { ApiPromise } from '@polkadot/api';
import BN from 'bn.js';
import { utils, Components } from '@reef-chain/react-lib';
import { utils as ethUtils } from 'ethers';
import { useHistory } from 'react-router-dom';
import TokenPricesContext from '../../context/TokenPricesContext';
import ReefSigners from '../../context/ReefSigners';
import { VALIDATORS_URL } from '../../urls';
import { localizedStrings as strings } from '../../l10n/l10n';
import { formatReefAmount } from '../../utils/formatReefAmount';
import { shortAddress } from '../../utils/utils';
import './validators.css';
import {
  loadValidators,
  saveValidators,
  loadCachedValidators,
  CACHE_ACTIVE_KEY,
  CachedValidator,
} from '../../utils/validatorsCache';
import calculateStakingAPY from '../../utils/calculateStakingAPY';

const { OverlayAction } = Components;

type ValidatorInfo = CachedValidator;

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
  const [nominations, setNominations] = useState<string[]>([]);
  const [nominatorStake, setNominatorStake] = useState<string>('0');
  const stakeNumber = Number(ethUtils.formatUnits(nominatorStake || '0', 18));
  const stakeUsd = stakeNumber * (tokenPrices[REEF_ADDRESS] || 0);
  const formattedStake = useMemo(
    () => formatReefAmount(new BN(nominatorStake)).replace(' REEF', ''),
    [nominatorStake],
  );
  const formatCompactUSD = (value: number): string => `${
    Intl.NumberFormat(navigator.language, {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 2,
    }).format(value)
  }$US`;
  const formattedStakeUsd = useMemo(() => formatCompactUSD(stakeUsd), [stakeUsd]);
  const [isNominationsOpen, setNominationsOpen] = useState(false);
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const TOTAL_POINTS_TARGET = 172800;
  const INFLATION_RATE = 0.0468;

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (!provider?.api || tab === 'actions') return;
      const api = provider.api as ApiPromise;
      try {
        // overview provides active and next elected validator addresses
        const overview: any = await api.derive.staking.overview();
        const era = overview.activeEra?.toString() || `${overview.activeEra}`;
        const cacheKey = CACHE_ACTIVE_KEY;
        const cached = loadValidators(cacheKey, era) as ValidatorInfo[] | null;
        if (cached) {
          setValidators(cached);
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
      } catch (e) {
        console.warn('Error loading validators', e);
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
    if (selectedSigner?.lockedBalance) {
      setNominatorStake(selectedSigner.lockedBalance.toString());
    } else {
      setNominatorStake('0');
    }
  }, [selectedSigner]);


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
          <Uik.Text type="lead" className="uik-text--lead">{strings.your_stake}</Uik.Text>
          <Uik.Text type="headline" className="dashboard__sub-balance-value">
            <span className="dashboard__balance-text">{formattedStake}</span>
            <Uik.ReefIcon />
            <span className="validators-page__stake-usd">
              ({formattedStakeUsd})
            </span>
          </Uik.Text>
          <Uik.Button text="My nominations" fill onClick={() => setNominationsOpen(true)} />
        </div>
      )}
      <OverlayAction
        isOpen={isNominationsOpen}
        onClose={() => setNominationsOpen(false)}
        title="My nominations"
      >
        <Uik.Table seamless>
          <Uik.THead>
            <Uik.Tr>
              <Uik.Th>Validator</Uik.Th>
            </Uik.Tr>
          </Uik.THead>
          <Uik.TBody>
            {nominations.map((n) => (
              <Uik.Tr key={n}>
                <Uik.Td>
                  <div className="validators-page__id">
                    {validators.find((v) => v.address === n)?.identity || shortAddress(n)}
                  </div>
                </Uik.Td>
              </Uik.Tr>
            ))}
          </Uik.TBody>
        </Uik.Table>
      </OverlayAction>
      {tab !== 'actions' && (
      <Uik.Table seamless>
        <Uik.THead>
          <Uik.Tr>
            <Uik.Th>{strings.account}</Uik.Th>
            <Uik.Th>{strings.total_staked}</Uik.Th>
            <Uik.Th>{strings.min_required}</Uik.Th>
            <Uik.Th>Commission</Uik.Th>
            <Uik.Th>APY</Uik.Th>
            <Uik.Th />
          </Uik.Tr>
        </Uik.THead>
        <Uik.TBody>
          {validators.map((v) => (
            <Uik.Tr key={v.address}>
              <Uik.Td>
                <div className="validators-page__id">
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
                {(() => {
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
                  return `${(apy * 100).toFixed(2)}%`;
                })()}
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
