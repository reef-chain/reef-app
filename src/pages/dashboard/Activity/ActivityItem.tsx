import { NFT, Token, utils } from '@reef-defi/react-lib';
import Uik from '@reef-chain/ui-kit';
import React, { useContext, useMemo } from 'react';
import './activity-item.css';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import HideBalance from '../../../context/HideBalance';
import { displayBalanceFromToken } from '../../../utils/displayBalance';
import { localizedStrings as strings } from '../../../l10n/l10n';
import { getIpfsGatewayUrl } from '../../../environment';

const { showBalance } = utils;

interface Props {
  timestamp: number;
  inbound: boolean;
  token: Token | NFT;
  url: string;
}

const formatDate = (timestamp: number): string => {
  let date = new Date(timestamp);
  const offset = date.getTimezoneOffset();
  date = new Date(date.getTime() - (offset * 60 * 1000));
  const formattedDate = date.toISOString().split('T')[0].split('-').reverse().join('-');
  const formattedTime = date.toISOString().split('T')[1].split(':').slice(0, 2).join(':');

  return `${formattedDate}, ${formattedTime}`;
};

const TokenActivityItem = ({
  token,
  timestamp,
  inbound,
  url,
}: Props): JSX.Element => {
  // @ts-ignore-next-line
  const {
    symbol,
    name,
    iconUrl,
  } = token;
  const {
    nftId,
    mimetype,
  } = token as NFT;
  const isNFT = nftId != null;
  const type: 'receive' | 'send' = inbound ? 'receive' : 'send';
  console.log('iiiii=', iconUrl);
  const title = useMemo(() => {
    const actionMap = {
      receive: strings.received,
      send: strings.sent,
    };

    const action = actionMap[type];
    return `${action} ${symbol || name}`;
  }, [type, symbol, name]);

  const amount = useMemo(() => {
    const amt = displayBalanceFromToken(token as Token);
    const prefixMap = {
      receive: '+',
      send: '-',
    };
    const prefix = prefixMap[type];

    return `${prefix} ${amt}`;
  }, [token, type]);

  const hideBalance = useContext(HideBalance);

  const activityPreviewIcon = useMemo(() => {
    const iconUrlIpfsResolved = iconUrl.startsWith('ipfs') ? getIpfsGatewayUrl(iconUrl.substring(7)) : iconUrl;

    const isVideoNFT = mimetype && mimetype.indexOf('mp4') > -1;

    if (!isNFT) {
      return (
        <div
          className="activity-item__amount-token-icon"
          style={{ backgroundImage: `url(${iconUrlIpfsResolved})` }}
        />
      );
    }

    return isVideoNFT ? (
      <div
        className="activity-item__nft-video-icon activity-item__nft-preview"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 111.34">
          <path
            fill="currentColor"
            d="M23.59,0h75.7a23.68,23.68,0,0,1,23.59,23.59V87.75A23.56,23.56,0,0,1,116,104.41l-.22.2a23.53,23.53,0,0,
            1-16.44,6.73H23.59a23.53,23.53,0,0,1-16.66-6.93l-.2-.22A23.46,23.46,0,0,1,0,87.75V23.59A23.66,23.66,0,0,1,
            23.59,0ZM54,47.73,79.25,65.36a3.79,3.79,0,0,1,.14,6.3L54.22,89.05a3.75,3.75,0,0,1-2.4.87A3.79,3.79,0,0,1,
            48,86.13V50.82h0A3.77,3.77,0,0,1,54,47.73ZM7.35,26.47h14L30.41,7.35H23.59A16.29,16.29,0,0,0,7.35,
            23.59v2.88ZM37.05,7.35,28,26.47H53.36L62.43,7.38v0Zm32,0L59.92,26.47h24.7L93.7,7.35Zm31.32,0L91.26,
            26.47h24.27V23.59a16.32,16.32,0,0,0-15.2-16.21Zm15.2,26.68H7.35V87.75A16.21,16.21,0,0,0,12,
            99.05l.17.16A16.19,16.19,0,0,0,23.59,104h75.7a16.21,16.21,0,0,0,11.3-4.6l.16-.18a16.17,16.17,0,0,0,
            4.78-11.46V34.06Z"
          />
        </svg>
      </div>
    ) : (
      <div
        className="activity-item__nft-preview"
        style={{ backgroundImage: `url(${iconUrlIpfsResolved})` }}
      />
    );
  }, [mimetype, isNFT, iconUrl]);

  return (
    <a
      key={timestamp}
      className={`
        activity-item
        activity-item--${type}
        ${isNFT ? 'activity-item--nft' : ''}
      `}
      href={url}
      target="_blank"
      rel="noreferrer"
    >
      <div className="activity-item__indicator">
        <Uik.Icon className="activity-item__indicator-icon" icon={faArrowDown} />
      </div>

      <div className="activity-item__content">
        <div className="activity-item__info">
          <div className="activity-item__title" title={title}>{ title }</div>
          <div className="activity-item__date">{ formatDate(timestamp) }</div>
        </div>

        {
          isNFT ? (
            activityPreviewIcon
          ) : (
            <div
              className="activity-item__amount-wrapper"
              title={`${type === 'receive' ? '+' : '-'} ${showBalance(token as Token)}`}
            >
              <div
                className={`
                  activity-item__amount
                  ${hideBalance.isHidden ? 'activity-item__amount--hidden' : ''}
                `}
              >
                {
                !hideBalance.isHidden ? amount : (
                  <div>
                    <div />
                    <div />
                    <div />
                    <div />
                    <div />
                  </div>
                )
              }
              </div>
              { activityPreviewIcon }
            </div>
          )
        }
      </div>
    </a>
  );
};

export default TokenActivityItem;

export const Skeleton = (): JSX.Element => (
  <div className="activity-item activity-item--skeleton">
    <div className="activity-item__indicator" />

    <div className="activity-item__content">
      <div className="activity-item__info">
        <div className="activity-item__title" />
        <div className="activity-item__date" />
      </div>

      <div className="activity-item__amount-wrapper">
        <div className="activity-item__amount" />
      </div>
    </div>
  </div>
);
