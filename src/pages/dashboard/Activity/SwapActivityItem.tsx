import { TokenTransfer } from '@reef-chain/react-lib';
import Uik from '@reef-chain/ui-kit';
import React from 'react';
import './activity-item.css';
import {
  faRepeat,
} from '@fortawesome/free-solid-svg-icons';
import '../loading-animation.css';
import SwapDetails from './SwapDetails';

interface Props {
  token1: TokenTransfer;
  token2: TokenTransfer;
  fees: TokenTransfer;
}

const formatDate = (timestamp: number): string => {
  let date = new Date(timestamp);
  const offset = date.getTimezoneOffset();
  date = new Date(date.getTime() - offset * 60 * 1000);
  const formattedDate = date
    .toISOString()
    .split('T')[0]
    .split('-')
    .reverse()
    .join('-');
  const formattedTime = date
    .toISOString()
    .split('T')[1]
    .split(':')
    .slice(0, 2)
    .join(':');

  return `${formattedDate}, ${formattedTime}`;
};

const SwapActivityItem = ({ token1, token2, fees }: Props): JSX.Element => (
  <>
    <div
      key={token1.timestamp}
      className={`
          activity-item
          activity-item--send
        `}
    >
      <div className="activity-item__indicator">
        <Uik.Icon icon={faRepeat} />
      </div>

      <div className="activity-item__content">
        <div
          className="activity-item__info"
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <div>
            <div
              className="activity-item__title"
              title={`Swap ${token1.token.symbol}-${token2.token.symbol}`}
            >
              {`Swap ${token1.token.symbol}-${token2.token.symbol}`}
            </div>
            <SwapDetails token1={token1} token2={token2} fees={fees} />
            <div className="activity-item__date">
              {formatDate(token1.timestamp)}
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default SwapActivityItem;
