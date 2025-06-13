import Uik from '@reef-chain/ui-kit';
import React, { useContext, useMemo } from 'react';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import HideBalance from '../../context/HideBalance';

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

  const formatCompactUSD = (value: number): string => `${
    Intl.NumberFormat(navigator.language, {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 2,
    }).format(value)
  }$US`;

  const getTotal = useMemo((): string => formatCompactUSD(total), [total]);

  const getAvailable = useMemo((): string => formatCompactUSD(available), [available]);

  const getStaked = useMemo((): string => formatCompactUSD(staked), [staked]);

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
          {loading ? (
            <Uik.Loading size="small" />
          ) : (
            <Uik.Text
              type="headline"
              className={`dashboard__sub-balance-value ${isHidden ? 'dashboard__balance-value--hidden' : ''}`}
            >
              {isHidden ? (
                <>
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                </>
              ) : (
                getAvailable
              )}
            </Uik.Text>
          )}
        </div>
        <div className="dashboard__balance-item">
          <Uik.Text type="lead">Staked</Uik.Text>
          {loading ? (
            <Uik.Loading size="small" />
          ) : (
            <Uik.Text
              type="headline"
              className={`dashboard__sub-balance-value ${isHidden ? 'dashboard__balance-value--hidden' : ''}`}
            >
              {isHidden ? (
                <>
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                </>
              ) : (
                getStaked
              )}
            </Uik.Text>
          )}
        </div>
      </div>
    </div>
  );
};
