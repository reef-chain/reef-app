import { NFT, Token, TokenTransfer, utils } from '@reef-chain/react-lib';
import Uik from '@reef-chain/ui-kit';
import React, { useContext, useMemo } from 'react';
import './activity-item.css';
import { faArrowDown, faExchange, faExchangeAlt, faPlay, faRepeat } from '@fortawesome/free-solid-svg-icons';
import HideBalance from '../../../context/HideBalance';
import { displayBalanceFromToken } from '../../../utils/displayBalance';
import { localizedStrings as strings } from '../../../l10n/l10n';
import { getIpfsGatewayUrl } from '../../../environment';
import '../loading-animation.css';

const { showBalance } = utils;

interface Props {
  token1: TokenTransfer;
  token2: TokenTransfer;
  fees: TokenTransfer;
}

const formatDate = (timestamp: number): string => {
  let date = new Date(timestamp);
  const offset = date.getTimezoneOffset();
  date = new Date(date.getTime() - offset * 60 * 1000);
  const formattedDate = date.toISOString().split('T')[0].split('-').reverse().join('-');
  const formattedTime = date.toISOString().split('T')[1].split(':').slice(0, 2).join(':');

  return `${formattedDate}, ${formattedTime}`;
};

const SwapActivityItem = ({ token1, token2, fees }: Props): JSX.Element => {
  const hideBalance = useContext(HideBalance);

  const type1: 'receive' | 'send' = token1.inbound ? 'receive' : 'send';
  const type2: 'receive' | 'send' = token2.inbound ? 'receive' : 'send';

  const amount1 = useMemo(() => {
    const amt = displayBalanceFromToken(token1.token as Token);
    const prefixMap = {
      receive: '+',
      send: '-',
    };
    const prefix = prefixMap[type1];

    return `${prefix} ${amt}`;
  }, [token1.token, type1]);

  const amount2 = useMemo(() => {
    const amt = displayBalanceFromToken(token2.token as Token);
    const prefixMap = {
      receive: '+',
      send: '-',
    };
    const prefix = prefixMap[type2];

    return `${prefix} ${amt}`;
  }, [token2.token, type2]);

  const activityPreviewIcon1 = useMemo(() => {
    const iconUrlIpfsResolved = token1.token.iconUrl.startsWith('ipfs')
      ? getIpfsGatewayUrl(token1.token.iconUrl.substring(7))
      : token1.token.iconUrl;

    return (
      <div
        className="activity-item__amount-token-icon"
        style={{ backgroundImage: `url(${iconUrlIpfsResolved})` }}
      />
    );
  }, [token1.token.iconUrl]);

  const activityPreviewIcon2 = useMemo(() => {
    const iconUrlIpfsResolved = token2.token.iconUrl.startsWith('ipfs')
      ? getIpfsGatewayUrl(token2.token.iconUrl.substring(7))
      : token2.token.iconUrl;

    return (
      <div
        className="activity-item__amount-token-icon"
        style={{ backgroundImage: `url(${iconUrlIpfsResolved})` }}
      />
    );
  }, [token2.token.iconUrl]);

  return (
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
          <div className="activity-item__info" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div className="activity-item__title" title={`Swap ${token1.token.symbol}-${token2.token.symbol}`}>
                {`Swap ${token1.token.symbol}-${token2.token.symbol}`}
              </div>
              <div className="activity-item__date">{formatDate(token1.timestamp)}</div>
            </div>
            <div>{displayBalanceFromToken(fees.token as Token) + ' REEF'}</div>
          </div>
          <div>
            <div
              className="activity-item__amount-wrapper"
              title={`${type1 === 'receive' ? '+' : '-'} ${showBalance(token1.token as Token)}`}
            >
              <div
                className={`
                    activity-item__amount-swap activity-item__amount
                    ${type1 == 'receive' ? 'activity-item__amount-swap-receive' : ''}
                    ${hideBalance.isHidden ? 'activity-item__amount--hidden' : ''}
                  `}
              >
                {!hideBalance.isHidden ? (type1 == 'receive' ? 'Received ' : 'Sent ') + amount1 + ' ' + token1.token.name : (
                  <div>
                    <div />
                    <div />
                    <div />
                    <div />
                    <div />
                  </div>
                )}
              </div>
              {activityPreviewIcon1}
            </div>
            <div
              className="activity-item__amount-wrapper"
              title={`${type2 === 'receive' ? '+' : '-'} ${showBalance(token2.token as Token)}`}
            >
              <div
                className={`
                    activity-item__amount-swap
                    activity-item__amount
                    ${type2 == 'receive' ? 'activity-item__amount-swap-receive' : ''}
                    ${hideBalance.isHidden ? 'activity-item__amount--hidden' : ''}
                  `}
              >
                {!hideBalance.isHidden ? (type2 == 'receive' ? 'Received ' : 'Sent ') + amount2 + ' ' + token2.token.name : (
                  <div>
                    <div />
                    <div />
                    <div />
                    <div />
                    <div />
                  </div>
                )}
              </div>
              {activityPreviewIcon2}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SwapActivityItem;
