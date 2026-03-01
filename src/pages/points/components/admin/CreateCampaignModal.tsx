import React, { useEffect, useMemo, useRef, useState, useContext } from 'react';
import Uik from '@reef-chain/ui-kit';
import { useFormo } from '@formo/analytics';
import ReefSigners from '../../../../context/ReefSigners';
import apiService from '../../api/apiService';
import { Campaign } from './CampaignTable';
import './createCampaignModal.css';

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

type EligibilityKey = 'bootstrappingEligible' | 'earlySznEligible' | 'memeSznEligible';
type DateKey =
  | 'bootstrappingStartDate'
  | 'bootstrappingEndDate'
  | 'earlySznStartDate'
  | 'earlySznEndDate'
  | 'memeSznStartDate'
  | 'memeSznEndDate';

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

function toDateInputValue(date?: string): string {
  if (!date) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date.slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}

function CreateCampaignModal({ isOpen, editingCampaign, onClose, onSuccess }: CreateCampaignModalProps) {
  const analyticsFormo = useFormo();
  const { network: nw } = useContext(ReefSigners);
  const poolDropdownRef = useRef<HTMLDivElement | null>(null);
  const [form, setForm] = useState<Campaign>(emptyForm());
  const [pools, setPools] = useState<PoolOption[]>([]);
  const [poolsLoading, setPoolsLoading] = useState(false);
  const [poolsError, setPoolsError] = useState<string | null>(null);
  const [poolSearchQuery, setPoolSearchQuery] = useState('');
  const [isPoolDropdownOpen, setIsPoolDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalTitle = editingCampaign ? 'Edit Campaign' : 'Create New Campaign';

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

    setForm(editingCampaign ? {
      ...editingCampaign,
      bootstrappingStartDate: toDateInputValue(editingCampaign.bootstrappingStartDate),
      bootstrappingEndDate: toDateInputValue(editingCampaign.bootstrappingEndDate),
      earlySznStartDate: toDateInputValue(editingCampaign.earlySznStartDate),
      earlySznEndDate: toDateInputValue(editingCampaign.earlySznEndDate),
      memeSznStartDate: toDateInputValue(editingCampaign.memeSznStartDate),
      memeSznEndDate: toDateInputValue(editingCampaign.memeSznEndDate),
    } : emptyForm());
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

  const setEligibility = (key: EligibilityKey, enabled: boolean) => {
    setField(key, enabled);
  };

  const setDateField = (key: DateKey, value: string) => {
    setField(key, value);
  };

  const handleClose = () => {
    setIsPoolDropdownOpen(false);
    setPoolSearchQuery('');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.poolAddress) {
      setError('Pool address is required');
      return;
    }
    setLoading(true);
    setError(null);
    
    const selectedPool = pools.find((p) => p.poolAddress === form.poolAddress);
    const campaignName = selectedPool 
      ? `${selectedPool.token0Symbol || ''}/${selectedPool.token1Symbol || ''}`.replace(/^\/|\/$/g, '') || form.poolAddress
      : form.poolAddress;
    
    try {
      if (editingCampaign) {
        analyticsFormo.track('campaign_update_clicked', {
          campaign_id: form.poolAddress,
          campaign_name: campaignName,
          network: nw?.name || 'mainnet',
        });
        
        await apiService.updateCampaign(form.poolAddress, form);
        
        analyticsFormo.track('campaign_update_success', {
          campaign_id: form.poolAddress,
          campaign_name: campaignName,
          network: nw?.name || 'mainnet',
        });
      } else {
        await apiService.createCampaign([form]);
        
        analyticsFormo.track('campaign_create_success', {
          campaign_id: form.poolAddress,
          campaign_name: campaignName,
          network: nw?.name || 'mainnet',
        });
      }
      onSuccess();
      handleClose();
    } catch (err: any) {
      if (editingCampaign) {
        analyticsFormo.track('campaign_update_failed', {
          campaign_id: form.poolAddress,
          campaign_name: campaignName,
          error_code: (err as any)?.response?.status || (err as any)?.code || 'UNKNOWN',
          error_message: (err as any)?.response?.data?.message || (err as any)?.message || 'Failed to update campaign',
          network: nw?.name || 'mainnet',
        });
      } else {
        analyticsFormo.track('campaign_create_failed', {
          campaign_id: form.poolAddress,
          campaign_name: campaignName,
          error_code: (err as any)?.response?.status || (err as any)?.code || 'UNKNOWN',
          error_message: (err as any)?.response?.data?.message || (err as any)?.message || 'Failed to create campaign',
          network: nw?.name || 'mainnet',
        });
      }
      
      setError(err.message || 'Failed to save campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Uik.Modal
      title={modalTitle}
      isOpen={isOpen}
      onClose={handleClose}
      className="points-admin-modal"
      footer={
        <div className="points-admin-modal__footer">
          <button
            type="button"
            className="points-admin-modal__btn points-admin-modal__btn--cancel"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="points-admin-modal__btn points-admin-modal__btn--primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (editingCampaign ? 'Updating...' : 'Creating...') : (editingCampaign ? 'Update Campaign' : 'Create Campaign')}
          </button>
        </div>
      }
    >
      <div className="points-admin-modal__content">
        {error && <div className="points-admin-modal__error">{error}</div>}

        {editingCampaign ? (
          <div className="points-admin-modal__pool-group">
            <label className="points-admin-modal__label">Pool Address</label>
            <div className="points-admin-modal__readonly">{form.poolAddress}</div>
          </div>
        ) : (
          <div ref={poolDropdownRef} className="points-admin-modal__pool-group">
            <label className="points-admin-modal__label">
              Select Pool <span className="points-admin-modal__required">*</span>
            </label>
            <button
              type="button"
              className={`points-admin-modal__select-trigger ${poolsError ? 'points-admin-modal__select-trigger--error' : ''}`}
              onClick={() => setIsPoolDropdownOpen((prev) => !prev)}
              disabled={poolsLoading}
            >
              <span className={`points-admin-modal__select-value ${!selectedPool ? 'points-admin-modal__select-value--placeholder' : ''}`}>
                {poolsLoading ? 'Loading pools...' : selectedPool?.label || 'Choose a pool'}
              </span>
              <span className={`points-admin-modal__select-caret ${isPoolDropdownOpen ? 'points-admin-modal__select-caret--open' : ''}`}>⌄</span>
            </button>
            {poolsError && <div className="points-admin-modal__field-error">{poolsError}</div>}

            {isPoolDropdownOpen && !poolsLoading && (
              <div className="points-admin-modal__select-dropdown">
                <div className="points-admin-modal__search-wrap">
                  <input
                    value={poolSearchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPoolSearchQuery(e.target.value)}
                    placeholder="Search by address or pair"
                    className="points-admin-modal__search-input"
                  />
                </div>
                <div className="points-admin-modal__options-list">
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
                        className={`points-admin-modal__option-btn ${form.poolAddress === pool.poolAddress ? 'points-admin-modal__option-btn--active' : ''}`}
                      >
                        <div className="points-admin-modal__option-main">{pool.label}</div>
                        <div className="points-admin-modal__option-meta">
                          {truncateAddress(pool.poolAddress)}
                          {pool.poolType ? ` • ${pool.poolType}` : ''}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="points-admin-modal__option-empty">No pools found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <h3 className="points-admin-modal__section-title">Season Configuration</h3>

        <div className="points-admin-modal__season-card points-admin-modal__season-card--boot">
          <div className="points-admin-modal__season-meta">
            <span className="points-admin-modal__season-icon points-admin-modal__season-icon--boot">B</span>
            <div>
              <h4 className="points-admin-modal__season-title">Bootstrapping Season</h4>
              <p className="points-admin-modal__season-subtitle">Enable early adoption rewards</p>
            </div>
          </div>
          <button
            type="button"
            className={`points-admin-modal__switch ${form.bootstrappingEligible ? 'points-admin-modal__switch--on' : ''}`}
            onClick={() => setEligibility('bootstrappingEligible', !Boolean(form.bootstrappingEligible))}
            aria-checked={Boolean(form.bootstrappingEligible)}
            role="switch"
          >
            <span className="points-admin-modal__switch-thumb" />
          </button>
        </div>
        {form.bootstrappingEligible && (
          <div className="points-admin-modal__dates-row">
            <label className="points-admin-modal__date-field">
              <span>Bootstrapping Start</span>
              <input
                className="points-admin-modal__date-input"
                type="date"
                value={form.bootstrappingStartDate || ''}
                onChange={(e) => setDateField('bootstrappingStartDate', e.target.value)}
              />
            </label>
            <label className="points-admin-modal__date-field">
              <span>Bootstrapping End</span>
              <input
                className="points-admin-modal__date-input"
                type="date"
                value={form.bootstrappingEndDate || ''}
                onChange={(e) => setDateField('bootstrappingEndDate', e.target.value)}
              />
            </label>
          </div>
        )}

        <div className="points-admin-modal__season-card points-admin-modal__season-card--early">
          <div className="points-admin-modal__season-meta">
            <span className="points-admin-modal__season-icon points-admin-modal__season-icon--early">E</span>
            <div>
              <h4 className="points-admin-modal__season-title">Early Season</h4>
              <p className="points-admin-modal__season-subtitle">Reward early participants</p>
            </div>
          </div>
          <button
            type="button"
            className={`points-admin-modal__switch ${form.earlySznEligible ? 'points-admin-modal__switch--on' : ''}`}
            onClick={() => setEligibility('earlySznEligible', !Boolean(form.earlySznEligible))}
            aria-checked={Boolean(form.earlySznEligible)}
            role="switch"
          >
            <span className="points-admin-modal__switch-thumb" />
          </button>
        </div>
        {form.earlySznEligible && (
          <div className="points-admin-modal__dates-row">
            <label className="points-admin-modal__date-field">
              <span>Early Szn Start</span>
              <input
                className="points-admin-modal__date-input"
                type="date"
                value={form.earlySznStartDate || ''}
                onChange={(e) => setDateField('earlySznStartDate', e.target.value)}
              />
            </label>
            <label className="points-admin-modal__date-field">
              <span>Early Szn End</span>
              <input
                className="points-admin-modal__date-input"
                type="date"
                value={form.earlySznEndDate || ''}
                onChange={(e) => setDateField('earlySznEndDate', e.target.value)}
              />
            </label>
          </div>
        )}

        <div className="points-admin-modal__season-card points-admin-modal__season-card--meme">
          <div className="points-admin-modal__season-meta">
            <span className="points-admin-modal__season-icon points-admin-modal__season-icon--meme">M</span>
            <div>
              <h4 className="points-admin-modal__season-title">Meme Season</h4>
              <p className="points-admin-modal__season-subtitle">Special meme token rewards</p>
            </div>
          </div>
          <button
            type="button"
            className={`points-admin-modal__switch ${form.memeSznEligible ? 'points-admin-modal__switch--on' : ''}`}
            onClick={() => setEligibility('memeSznEligible', !Boolean(form.memeSznEligible))}
            aria-checked={Boolean(form.memeSznEligible)}
            role="switch"
          >
            <span className="points-admin-modal__switch-thumb" />
          </button>
        </div>
        {form.memeSznEligible && (
          <div className="points-admin-modal__dates-row">
            <label className="points-admin-modal__date-field">
              <span>Meme Szn Start</span>
              <input
                className="points-admin-modal__date-input"
                type="date"
                value={form.memeSznStartDate || ''}
                onChange={(e) => setDateField('memeSznStartDate', e.target.value)}
              />
            </label>
            <label className="points-admin-modal__date-field">
              <span>Meme Szn End</span>
              <input
                className="points-admin-modal__date-input"
                type="date"
                value={form.memeSznEndDate || ''}
                onChange={(e) => setDateField('memeSznEndDate', e.target.value)}
              />
            </label>
          </div>
        )}
      </div>
    </Uik.Modal>
  );
}

export default CreateCampaignModal;
