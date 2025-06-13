import Uik from '@reef-chain/ui-kit';
import React, { useContext, useMemo } from 'react';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { toCurrencyFormat } from '../../utils/utils';
import HideBalance from '../../context/HideBalance';
import { displayBalance } from '../../utils/displayBalance';

interface Balance {
  total: number;
  available: number;
  staked: number;
  loading: boolean;
  className?: string;
}

export const Loading = (): JSX.Element => (
  <span className="dashboard__balance-loading">
    <div className="dashboard__balance-loading__container">
      <span>$</span>
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </div>
  </span>
);

export const Balance = ({
  total,
  available,
  staked,
  loading,
  className,
}: Balance): JSX.Element => {
  const { isHidden, toggle } = useContext(HideBalance);

  const getTotal = useMemo((): string => {
    if (total >= 1000000) {
      return `$${displayBalance(total)}`;
    }

    return toCurrencyFormat(total as number, { maximumFractionDigits: total < 10000 ? 2 : 0 });
  }, [total]);

  const getAvailable = useMemo((): string => toCurrencyFormat(available, { maximumFractionDigits: available < 10000 ? 2 : 0 }), [available]);

  const getStaked = useMemo((): string => toCurrencyFormat(staked, { maximumFractionDigits: staked < 10000 ? 2 : 0 }), [staked]);

  const toggleHidden = (): void => {
    if (isHidden) toggle();
  };

  return (
    <div className={`
      dashboard__balance
      ${className || ''}
    `}
    >
      <div className="dashboard__balance-label">
        <Uik.Text type="lead">Total</Uik.Text>
        <button
          key={String(isHidden)}
          type="button"
          className={`
              dashboard__balance-hide-btn
              ${isHidden ? 'dashboard__balance-hide-btn--hidden' : ''}
            `}
          onClick={toggle}
        >
          <Uik.Icon icon={isHidden ? faEyeSlash : faEye} />
        </button>
      </div>
      {
        loading || getTotal === 'US$NaN'
          ? <Loading />
          : (
            <button
              type="button"
              className={`
                dashboard__balance-value
                ${isHidden ? 'dashboard__balance-value--hidden' : ''}
              `}
              onClick={toggleHidden}
            >
              {
                isHidden
                  ? (
                    <>
                      <Uik.Text type="headline">$</Uik.Text>
                      <div />
                      <div />
                      <div />
                      <div />
                      <div />
                    </>
                  )
                  : <Uik.Text type="headline">{getTotal}</Uik.Text>
              }
            </button>
          )
      }
      <div className="dashboard__balance-sub">
        <div className="dashboard__balance-item">
          <Uik.Text type="lead">Available</Uik.Text>
          {loading ? <Uik.Loading size="small" />
            : <Uik.Text type="headline">{isHidden ? '***' : getAvailable}</Uik.Text>}
        </div>
        <div className="dashboard__balance-item">
          <Uik.Text type="lead">Staked</Uik.Text>
          {loading ? <Uik.Loading size="small" />
            : <Uik.Text type="headline">{isHidden ? '***' : getStaked}</Uik.Text>}
        </div>
      </div>
    </div>
  );
};
