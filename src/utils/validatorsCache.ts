export interface CachedValidator {
  address: string;
  identity?: string;
  totalBonded: string;
  commission: string;
  isActive: boolean;
  minRequired: string;
}

export interface ValidatorInfo extends CachedValidator {
  apy?: number;
}

interface CacheEntry {
  era: string;
  validators: ValidatorInfo[];
}

export const CACHE_ACTIVE_KEY = 'cached-active-validators';

export const saveValidators = (
  key: string,
  era: string,
  validators: ValidatorInfo[],
): void => {
  try {
    const data: CacheEntry = { era, validators };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    // ignore localStorage errors
  }
};

export const loadValidators = (
  key: string,
  era: string,
): ValidatorInfo[] | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (parsed.era === era) return parsed.validators;
  } catch (e) {
    // ignore parsing errors
  }
  return null;
};

export const loadCachedValidators = (
  key: string,
): ValidatorInfo[] | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    return parsed.validators;
  } catch (e) {
    // ignore parsing errors
  }
  return null;
};
