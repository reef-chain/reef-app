import React, {
  useEffect, useState, useContext, useMemo,
} from 'react';
import Uik from '@reef-chain/ui-kit';
import { ApiPromise } from '@polkadot/api';
import BN from 'bn.js';
import { utils, Components } from '@reef-chain/react-lib';
import { utils as ethUtils } from 'ethers';
import TokenPricesContext from '../../context/TokenPricesContext';
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
import './validators.css';
import BondActionModal from '../../components/staking/BondActionModal';

const { OverlayAction } = Components;

type ValidatorInfo = CachedValidator;

const Actions: React.FC = () => {
  const { provider, selectedSigner } = useContext(ReefSigners);
  const tokenPrices = useContext(TokenPricesContext);
  const { REEF_ADDRESS } = utils;

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
  const [isBondOpen, setBondOpen] = useState(false);
  const [nominationMap, setNominationMap] = useState<Record<string, boolean>>({});
  const [changingNoms, setChangingNoms] = useState(false);

  useEffect(() => {
    const map: Record<string, boolean> = {};
    validators.forEach((v) => {
      map[v.address] = nominations.includes(v.address);
    });
    setNominationMap(map);
  }, [validators, nominations]);

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
        const addresses: string[] = overview.validators.map((a: any) => a.toString());
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
          vals.push({
            address: addr,
            identity,
            totalBonded: (exposure as any)?.total?.toString() || '0',
            commission: prefs?.commission?.toString() || '0',
            isActive: addresses.includes(addr),
            minRequired: '0',
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
    if (selectedSigner?.lockedBalance) {
      setNominatorStake(selectedSigner.lockedBalance.toString());
    } else {
      setNominatorStake('0');
    }
  }, [selectedSigner]);

  const toggleNomination = (addr: string): void => {
    setNominationMap({
      ...nominationMap,
      [addr]: !nominationMap[addr],
    });
  };

  const handleChangeNominations = async (): Promise<void> => {
    if (!provider?.api || !selectedSigner) return;
    const api = provider.api as ApiPromise;
    const targets = Object.keys(nominationMap).filter((a) => nominationMap[a]);
    try {
      setChangingNoms(true);
      await api.tx.staking
        .nominate(targets)
        .signAndSend(selectedSigner.address, ({ status }: any) => {
          if (status.isInBlock || status.isFinalized) {
            Uik.notify.success('Nominations updated');
            setChangingNoms(false);
            setNominations(targets);
            setNominationsOpen(false);
          }
        });
    } catch (e) {
      setChangingNoms(false);
      Uik.notify.danger('Failed to update nominations');
    }
  };

  return (
    <div>
      {selectedSigner && (
        <div className="validators-page__stake">
          <Uik.Text type="lead" className="uik-text--lead">{strings.your_stake}</Uik.Text>
          <Uik.Text type="headline" className="dashboard__sub-balance-value">
            <span className="dashboard__balance-text">{formattedStake}</span>
            <Uik.ReefIcon />
            <span className="validators-page__stake-usd">
              (
              {formattedStakeUsd}
              )
            </span>
          </Uik.Text>
          <Uik.Button text="My nominations" fill onClick={() => setNominationsOpen(true)} />
          <Uik.Button text={strings.staking_bond_unbond} fill onClick={() => setBondOpen(true)} />
        </div>
      )}
      <OverlayAction
        isOpen={isNominationsOpen}
        onClose={() => setNominationsOpen(false)}
        title="My nominations"
        className="my-nominations"
      >
        <div className="my-nominations__btn-container">
          <Uik.Button
            text="Change Nominations"
            loading={changingNoms}
            onClick={handleChangeNominations}
            success
            fill
          />
        </div>
        <Uik.Table seamless>
          <Uik.THead>
            <Uik.Tr>
              <Uik.Th>Validator</Uik.Th>
              <Uik.Th>Nominate</Uik.Th>
            </Uik.Tr>
          </Uik.THead>
          <Uik.TBody>
            {validators.map((v) => (
              <Uik.Tr key={v.address}>
                <Uik.Td>
                  <div className="validators-page__id">
                    {v.identity || shortAddress(v.address)}
                  </div>
                </Uik.Td>
                <Uik.Td>
                  <Uik.Toggle
                    onText="Enabled"
                    offText="Disabled"
                    value={nominationMap[v.address]}
                    onChange={() => toggleNomination(v.address)}
                  />
                </Uik.Td>
              </Uik.Tr>
            ))}
          </Uik.TBody>
        </Uik.Table>
      </OverlayAction>
      <BondActionModal
        isOpen={isBondOpen}
        onClose={() => setBondOpen(false)}
        api={provider?.api as ApiPromise}
        accountAddress={selectedSigner?.address || ''}
        stakeNumber={stakeNumber}
      />
    </div>
  );
};

export default Actions;
