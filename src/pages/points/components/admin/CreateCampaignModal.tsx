import React, { useEffect, useMemo, useRef, useState } from 'react';
import Uik from '@reef-chain/ui-kit';
import apiService from '../../api/apiService';
import { Campaign } from './CampaignTable';

interface CreateCampaignModalProps {
  isOpen: boolean;
  editingCampaign: Campaign | null;
  onClose: () => void;
  onSuccess: () => void;
}

const emptyForm = (): Campaign => ({
  poolAddress: '',
  bootstrappingEligible: false,
  earlySznEligible: false,
  memeSznEligible: false,
  bootstrappingStartDate: '',
  bootstrappingEndDate: '',
  earlySznStartDate: '',
  earlySznEndDate: '',
  memeSznStartDate: '',
  memeSznEndDate: '',
});

interface PoolOption {
  poolAddress: string;
  label: string;
  token0Symbol?: string;
  token1Symbol?: string;
  poolType?: string;
}

type RawPoolOption = string | {
  poolAddress?: string;
  address?: string;
  value?: string;
  label?: string;
  token0Symbol?: string;
  token1Symbol?: string;
  poolType?: string;
};

function normalizePoolOption(option: RawPoolOption): PoolOption | null {
  if (typeof option === 'string') {
    const value = option.trim();
    return value ? { poolAddress: value, label: value } : null;
  }

  const poolAddress = String(
    option.poolAddress || option.address || option.value || ''
  ).trim();

  if (!poolAddress) return null;

  const token0Symbol = option.token0Symbol?.trim();
  const token1Symbol = option.token1Symbol?.trim();
  const tokenPair = token0Symbol && token1Symbol ? `${token0Symbol}/${token1Symbol}` : '';
  const label = (option.label || tokenPair || poolAddress).trim();

  return {
    poolAddress,
    label,
    token0Symbol,
    token1Symbol,
    poolType: option.poolType,
  };
}

function normalizePoolOptions(payload: unknown): PoolOption[] {
  const source = Array.isArray(payload) ? payload : [];
  const output: PoolOption[] = [];
  const seen = new Set<string>();

  source.forEach((item) => {
    const normalized = normalizePoolOption(item as RawPoolOption);
    if (!normalized || seen.has(normalized.poolAddress)) return;
    seen.add(normalized.poolAddress);
    output.push(normalized);
  });

  return output;
}

function truncateAddress(address: string): string {
  if (!address || address.length <= 14) return address;
  return `${address.slice(0, 10)}...${address.slice(-8)}`;
}

function CreateCampaignModal({ isOpen, editingCampaign, onClose, onSuccess }: CreateCampaignModalProps) {
  const poolDropdownRef = useRef<HTMLDivElement | null>(null);
  const [form, setForm] = useState<Campaign>(emptyForm());
  const [pools, setPools] = useState<PoolOption[]>([]);
  const [poolsLoading, setPoolsLoading] = useState(false);
  const [poolsError, setPoolsError] = useState<string | null>(null);
  const [poolSearchQuery, setPoolSearchQuery] = useState('');
  const [isPoolDropdownOpen, setIsPoolDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPool = useMemo(
    () => pools.find((pool) => pool.poolAddress === form.poolAddress),
    [pools, form.poolAddress]
  );

  const filteredPools = useMemo(() => {
    const query = poolSearchQuery.trim().toLowerCase();
    if (!query) return pools;

    return pools.filter((pool) => (
      pool.label.toLowerCase().includes(query)
      || pool.poolAddress.toLowerCase().includes(query)
      || `${pool.token0Symbol || ''} ${pool.token1Symbol || ''}`.toLowerCase().includes(query)
    ));
  }, [pools, poolSearchQuery]);

  useEffect(() => {
    if (!isOpen) {
      setIsPoolDropdownOpen(false);
      setPoolSearchQuery('');
      return;
    }

    setForm(editingCampaign ? { ...editingCampaign } : emptyForm());
    setError(null);
    setPoolsError(null);
    setPoolSearchQuery('');
    setIsPoolDropdownOpen(false);

    setPoolsLoading(true);
    apiService.getPools().then((res: unknown) => {
      const payload = Array.isArray(res)
        ? res
        : (res as { data?: unknown[] })?.data;
      const options = normalizePoolOptions(payload);
      setPools(options);
      if (options.length === 0) {
        setPoolsError('No pools available for campaign creation');
      }
    }).catch((err: unknown) => {
      const message = (err && typeof err === 'object' && 'message' in err)
        ? String((err as { message?: string }).message)
        : 'Failed to load pools';
      setPools([]);
      setPoolsError(message);
    }).finally(() => {
      setPoolsLoading(false);
    });
  }, [isOpen, editingCampaign]);

  useEffect(() => {
    if (isOpen) {
      const closeDropdown = () => setIsPoolDropdownOpen(false);
      window.addEventListener('scroll', closeDropdown, true);
      return () => window.removeEventListener('scroll', closeDropdown, true);
    }
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isPoolDropdownOpen) return undefined;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (target && poolDropdownRef.current && !poolDropdownRef.current.contains(target)) {
        setIsPoolDropdownOpen(false);
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, isPoolDropdownOpen]);

  const setField = <K extends keyof Campaign>(key: K, value: Campaign[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.poolAddress) {
      setError('Pool address is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (editingCampaign) {
        await apiService.updateCampaign(form.poolAddress, form);
      } else {
        await apiService.createCampaign([form]);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Uik.Modal
      title={editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Uik.Button text="Cancel" onClick={onClose} />
          <Uik.Button fill text={editingCampaign ? 'Update' : 'Create'} loading={loading} onClick={handleSubmit} />
        </div>
      }
    >
      <Uik.Form>
        {error && <Uik.Alert type="danger" text={error} />}

        {editingCampaign ? (
          <Uik.Input label="Pool Address" value={form.poolAddress} readOnly />
        ) : (
          <div ref={poolDropdownRef} style={{ position: 'relative' }}>
            <Uik.Input
              label="Pool Address"
              value={selectedPool?.label || form.poolAddress}
              placeholder={poolsLoading ? 'Loading pools...' : 'Select a pool'}
              readOnly
              onFocus={() => setIsPoolDropdownOpen(true)}
              error={poolsError || undefined}
            />

            {isPoolDropdownOpen && !poolsLoading && (
              <div
                style={{
                  position: 'absolute',
                  zIndex: 20,
                  width: '100%',
                  marginTop: '0.35rem',
                  borderRadius: '10px',
                  border: '1px solid #d8dce8',
                  background: '#fff',
                  boxShadow: '0 10px 28px rgba(25, 29, 44, 0.16)',
                }}
              >
                <div style={{ padding: '0.65rem 0.65rem 0.4rem' }}>
                  <Uik.Input
                    value={poolSearchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPoolSearchQuery(e.target.value)}
                    placeholder="Search by address or pair"
                  />
                </div>
                <div style={{ maxHeight: '220px', overflowY: 'auto', paddingBottom: '0.35rem' }}>
                  {filteredPools.length > 0 ? (
                    filteredPools.map((pool) => (
                      <button
                        key={pool.poolAddress}
                        type="button"
                        onClick={() => {
                          setField('poolAddress', pool.poolAddress);
                          setIsPoolDropdownOpen(false);
                          setPoolSearchQuery('');
                          setError(null);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          border: 'none',
                          background: form.poolAddress === pool.poolAddress ? 'rgba(169, 49, 133, 0.12)' : 'transparent',
                          padding: '0.6rem 0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{pool.label}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.68 }}>
                          {truncateAddress(pool.poolAddress)}
                          {pool.poolType ? ` • ${pool.poolType}` : ''}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div style={{ padding: '0.75rem', fontSize: '0.88rem', opacity: 0.7 }}>
                      No pools found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <Uik.Divider text="Eligibility" />

        <Uik.Checkbox
          label="Bootstrapping Eligible"
          value={!!form.bootstrappingEligible}
          onChange={(checked: boolean) => setField('bootstrappingEligible', checked)}
        />
        {form.bootstrappingEligible && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Uik.Input
              label="Bootstrapping Start"
              type="date"
              value={form.bootstrappingStartDate || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('bootstrappingStartDate', e.target.value)}
            />
            <Uik.Input
              label="Bootstrapping End"
              type="date"
              value={form.bootstrappingEndDate || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('bootstrappingEndDate', e.target.value)}
            />
          </div>
        )}

        <Uik.Checkbox
          label="Early Season Eligible"
          value={!!form.earlySznEligible}
          onChange={(checked: boolean) => setField('earlySznEligible', checked)}
        />
        {form.earlySznEligible && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Uik.Input
              label="Early Szn Start"
              type="date"
              value={form.earlySznStartDate || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('earlySznStartDate', e.target.value)}
            />
            <Uik.Input
              label="Early Szn End"
              type="date"
              value={form.earlySznEndDate || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('earlySznEndDate', e.target.value)}
            />
          </div>
        )}

        <Uik.Checkbox
          label="Meme Season Eligible"
          value={!!form.memeSznEligible}
          onChange={(checked: boolean) => setField('memeSznEligible', checked)}
        />
        {form.memeSznEligible && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Uik.Input
              label="Meme Szn Start"
              type="date"
              value={form.memeSznStartDate || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('memeSznStartDate', e.target.value)}
            />
            <Uik.Input
              label="Meme Szn End"
              type="date"
              value={form.memeSznEndDate || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('memeSznEndDate', e.target.value)}
            />
          </div>
        )}
      </Uik.Form>
    </Uik.Modal>
  );
}

export default CreateCampaignModal;
