import './stats.css';
import Uik from '@reef-chain/ui-kit';
import React, { useContext, useState } from 'react';
import { hooks } from '@reef-chain/react-lib';
import { faRightLeft } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';
import PoolSelect from './PoolSelect';
import PoolTransactions from './PoolTransactions';
import { localizedStrings } from '../../../l10n/l10n';
import ReefSigners from '../../../context/ReefSigners';

interface StatsProps {
  data: hooks.PoolStats;
  price1: number;
  price2: number;
  reefscanUrl: string;
}
interface TokenStatsProps {
  token: hooks.TokenStats;
  price: number;
}

const displayAmount = (amount: string | number): string => {
  if (
    typeof amount === 'number' && Number.isNaN(amount)
    || typeof amount === 'string' && amount === 'NaN'
  ) return '0';
  return Uik.utils.formatHumanAmount(amount);
};

const Token = ({ token, price }: TokenStatsProps): JSX.Element => {
  const { network } = useContext(ReefSigners);

  return (
    <div className="pool-stats__token">
      <div className="pool-stats__token-info">
        <div className="pool-stats__token-main">
          <div onClick={() => window.open(`${network.reefscanUrl}/token/${token.address}`)} className='pool-stats__token-image'>
            <Uik.Tooltip
              text={token.address}
              position="bottom"
              children={
                <img
                  src={token.icon}
                  alt={token.symbol}
                  className={`
                pool-stats__token-image
                pool-stats__token-image--${Uik.utils.slug(token.symbol)}
              `}
                />
              }
            />
          </div>

          <div>
            <div className="pool-stats__token-name">{token.symbol}</div>
            <div className="pool-stats__token-percentage">
              {token.percentage}
              %
            </div>
          </div>
        </div>

        <div>
          <div className="pool-stats__token-price">
            $
            {typeof price !== 'number' ? '?' : price.toFixed(4)}
          </div>
          <div className="pool-stats__token-value-ratio">
            {displayAmount(token.ratio.amount)}
            {' '}
            {token.ratio.symbol}
          </div>
        </div>
      </div>

      <div className="pool-stats__token-stats">
        <div className="pool-stats__token-stat">
          <div className="pool-stats__token-stat-label">Total Liquidity</div>
          <div className="pool-stats__token-stat-value">{displayAmount(token.amountLocked)}</div>
        </div>

        <div className="pool-stats__token-stat">
          <div className="pool-stats__token-stat-label">My Liquidity</div>
          <div className="pool-stats__token-stat-value">{displayAmount(token.mySupply)}</div>
        </div>

        <div className="pool-stats__token-stat">
          <div className="pool-stats__token-stat-label">Fees 24h</div>
          <div className="pool-stats__token-stat-value">{displayAmount(token.fees24h)}</div>
        </div>
      </div>
    </div>
  )
};

interface UrlParams {
  address: string;
}

const Stats = ({
  data,
  price1,
  price2,
  reefscanUrl,
}: StatsProps): JSX.Element => {
  const [isSelectOpen, setSelectOpen] = useState(false);
  const [isTransactionsOpen, setTransactionsOpen] = useState(false);

  const { address } = useParams<UrlParams>();

  return (
    <div className="pool-stats">
      <div className="pool-stats__wrapper">
        <div className="pool-stats__main">
          <Uik.Container flow="spaceBetween">
            <div
              className="pool-stats__pool-select"
            >
              {/* <button
                  className="pool-stats__pool-select"
                  type="button"
                  onClick={() => setSelectOpen(true)}
              > */}
              <div className="pool-stats__pool-select-pair">
                <img
                  src={data.firstToken.icon}
                  alt={data.firstToken.symbol}
                  className={`pool-stats__pool-select-pair--${Uik.utils.slug(data.firstToken.symbol)}`}
                />
                <img
                  src={data.secondToken.icon}
                  alt={data.firstToken.symbol}
                  className={`pool-stats__pool-select-pair--${Uik.utils.slug(data.secondToken.symbol)}`}
                />
              </div>
              <span className="pool-stats__pool-select-name">
                {data.firstToken.symbol}
                {' '}
                /
                {' '}
                {data.secondToken.symbol}
              </span>
            </div>

            <Uik.Button
              className="pool-stats__transactions-btn"
              size="small"
              text={localizedStrings.show_transactions}
              icon={faRightLeft}
              onClick={() => setTransactionsOpen(true)}
            />
          </Uik.Container>

          <Uik.Container className="pool-stats__main-stats">
            <div className="pool-stats__main-stat">
              <div className="pool-stats__main-stat-label">Total Value Locked</div>
              <div className="pool-stats__main-stat-value">
                $
                {' '}
                {displayAmount(data.tvlUSD)}
              </div>
            </div>

            <div className="pool-stats__main-stat">
              <div className="pool-stats__main-stat-label">My Liquidity</div>
              <div className="pool-stats__main-stat-value">
                $
                {' '}
                {displayAmount(data.mySupplyUSD)}
              </div>
            </div>

            <div className="pool-stats__main-stat">
              <div className="pool-stats__main-stat-label">24h Volume</div>
              <div className="pool-stats__main-stat-value">
                <span>
                  $
                  {' '}
                  {displayAmount(data.volume24hUSD)}
                </span>
                <Uik.Trend
                  type={data.volumeChange24h >= 0 ? 'good' : 'bad'}
                  direction={data.volumeChange24h >= 0 ? 'up' : 'down'}
                  text={`${data.volumeChange24h.toFixed(2)}%`}
                />
              </div>
            </div>
          </Uik.Container>
        </div>

        <div className="pool-stats__tokens">
          <Token token={data.firstToken} price={price1} />
          <Token token={data.secondToken} price={price2} />
        </div>
      </div>

      <Uik.Bubbles />

      <PoolSelect
        isOpen={isSelectOpen}
        onClose={() => setSelectOpen(false)}
      />

      <PoolTransactions
        address={address}
        reefscanUrl={reefscanUrl}
        isOpen={isTransactionsOpen}
        onClose={() => setTransactionsOpen(false)}
        tokens={{
          firstToken: data.firstToken,
          secondToken: data.secondToken,
        }}
      />
    </div>
  );
};

export default Stats;
