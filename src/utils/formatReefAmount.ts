import BN from 'bn.js';
import BigNumber from 'bignumber.js';

/**
 * Format a value in Planck (18 decimals) into a human readable
 * string in REEF with dynamic K/M/B suffix. The returned string
 * is always in English and truncated to at most two decimals.
 */
export function formatReefAmount(value: BN): string {
  const PLANCK_DECIMALS = 18;
  const PLANCK_IN_REEF = new BigNumber('10').pow(PLANCK_DECIMALS);
  let reef = new BigNumber(value.toString()).dividedBy(PLANCK_IN_REEF);

  const units = ['', 'K', 'M', 'B'];
  let unitIndex = 0;
  while (reef.isGreaterThanOrEqualTo(1000) && unitIndex < units.length - 1) {
    reef = reef.dividedBy(1000);
    unitIndex += 1;
  }

  const truncated = reef.decimalPlaces(2, BigNumber.ROUND_DOWN).toFixed();
  const cleaned = truncated.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
  return `${cleaned}${units[unitIndex]} REEF`;
}
