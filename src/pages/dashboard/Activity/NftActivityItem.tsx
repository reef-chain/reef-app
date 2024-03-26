import Uik from '@reef-chain/ui-kit';
import React from 'react';
import './activity-item.css';
import {
  faRepeat,
} from '@fortawesome/free-solid-svg-icons';
import '../loading-animation.css';
import { tokenUtil } from '@reef-chain/util-lib';
import SwapDetails from './SwapDetails';

interface Props {
  token1: tokenUtil.TokenTransfer;
  token2: tokenUtil.TokenTransfer;
  fees: tokenUtil.TokenTransfer;
  isBought: boolean;
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

const NftActivityItem = ({ token1, token2, fees, isBought }: Props): JSX.Element => (
  <>
    <div
      key={token1.timestamp}
      className={`
          activity-item
          activity-item--send
        `}
    >
       <div className="activity-item__indicator">
          <Uik.Icon className="activity-item__indicator-icon" icon={faRepeat} />
        </div>

      <div className="activity-item__content">
        <div
          style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
        >
          <div style={{ width: '100%' }}>
            <div
              className="activity-item__title"
              title={`${isBought? "Purchased":"Sold"} ${token1.token.name}`}
            >
              {`${isBought? "Purchased":"Sold"} ${token1.token.name}`}
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

export default NftActivityItem;
