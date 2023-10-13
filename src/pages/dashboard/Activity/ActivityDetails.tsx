import {
  NFT, Token, utils, Components,
} from '@reef-defi/react-lib';
import React, {
  useContext, useMemo,
} from 'react';
import './activity-details.css';
import Uik from '@reef-chain/ui-kit';
import {
  faArrowDown,
} from '@fortawesome/free-solid-svg-icons';
import { differenceInDays } from 'date-fns';
import HideBalance from '../../../context/HideBalance';
import { displayBalanceFromToken } from '../../../utils/displayBalance';
import { shortAddress } from '../../../utils/utils';

const { showBalance } = utils;
const { OverlayAction } = Components;

export interface Props {
  isOpen: boolean;
  onClose: () => void;
  from: string;
  to: string;
  inbound: boolean;
  url: string;
  token: Token | NFT;
  timestamp: number;
}

const formatDate = (timestamp: number): string => {
  const today = new Date();
  const date = new Date(timestamp);

  const difference = differenceInDays(today, date);
  return `${difference} days ago`;
};

const getTokenUrl = (tokenUrl:string):string => {
  const ipfsProtocol = 'ipfs://';
  if (tokenUrl?.startsWith(ipfsProtocol)) {
    return `https://cloudflare-ipfs.com/ipfs/${tokenUrl.substring(ipfsProtocol.length)}`;
  }
  return tokenUrl;
};

const ActivityDetails = ({
  isOpen,
  onClose,
  timestamp,
  from,
  to,
  inbound,
  url,
  token,
}: Props): JSX.Element => {
  const isNFT = !!(token as NFT).nftId;
  const type: 'receive' | 'send' = inbound ? 'receive' : 'send';

  const title = useMemo(() => {
    const actionMap = {
      receive: 'Received',
      send: 'Sent',
    };

    const action = actionMap[type];
    return `${action} ${token.symbol || token.name}`;
  }, [type, token.symbol]);

  const amount = useMemo(() => {
    const amt = displayBalanceFromToken(token as Token);

    if (isNFT) {
      return `${amt}`;
    }

    const prefixMap = {
      receive: '+',
      send: '-',
    };
    const prefix = prefixMap[type];

    return `${prefix} ${amt} ${token.name}`;
  }, [token, type]);

  const hideBalance = useContext(HideBalance);

  return (
    <OverlayAction
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      className="overlay-swap"
    >
      <div className="transfer-asset__container">
        <div className="transfer-asset-summary">
          {isNFT ? (
            <div
              key={timestamp}
              className={`
              transfer-asset
              transfer-asset--${type}
              transfer-asset--nft
            `}
            >
              <div className="transfer-asset__content-ntf">
                <div className="transfer-asset__block">
                  <div
                    className="transfer-asset__nft-preview row-span-2"
                    style={{ backgroundImage: `url(${token.iconUrl})` }}
                  >
                    <div className="transfer-asset__indicator">
                      <Uik.Icon
                        className="transfer-asset__indicator-icon"
                        icon={faArrowDown}
                      />
                    </div>
                  </div>
                  <div className="amount-wrapper">
                    <div
                      className={`
                    transfer-asset__amount-wrapper
                    ${isNFT ? 'transfer-asset__nft-quantity-indicator' : ''}
                  `}
                      title={`${type === 'receive' ? '+' : '-'} ${showBalance(
                              token as Token,
                      )}`}
                    >
                      <div
                        className={`
                        transfer-asset__amount
                        ${
                                hideBalance.isHidden
                                  ? 'transfer-asset__amount--hidden'
                                  : ''
                            }
                      `}
                      >
                        {!hideBalance.isHidden ? (
                          <>
                            {amount}
                          </>
                        ) : (
                          <div>
                            <div />
                            <div />
                            <div />
                            <div />
                            <div />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="transfer-asset__date">
                      {formatDate(timestamp)}
                    </div>
                  </div>

                </div>

                <Uik.Text text="Transfer Details" type="light" className="mt-2" />
                <div className="transfer-asset__block my-2">
                  <div className="transfer-detail">
                    <div className="my-auto mx-2 fs-6">

                      <div className="transfer-asset__wallet">
                        <span className="transfer-asset__wallet-address">
                          {shortAddress(from)}
                        </span>
                      </div>
                    </div>
                    <div className="transfer-asset__direction-indicator" />
                    <div className="my-auto mx-2 fs-6">

                      <div className="transfer-asset__wallet">
                        <span className="transfer-asset__wallet-address">
                          {shortAddress(to)}
                        </span>
                      </div>

                    </div>
                  </div>
                </div>
                <Uik.Button text="Details" onClick={() => window.open(url, '_blank')} />

              </div>
            </div>
          ) : (
            <div
              key={timestamp}
              className={`
            transfer-asset
            transfer-asset--${type}
            `}
            >
              <div className="transfer-asset__content-token">
                <div className="transfer-asset__block col-span-6">

                  <div
                    className="transfer-asset__amount-token-icon"
                    style={{ backgroundImage: `url(${getTokenUrl(token.iconUrl)})`, padding: '8px' }}
                  />
                  <div>
                    <div>
                      <div
                        className="transfer-asset__amount-wrapper"
                        title={`${type === 'receive' ? '+' : '-'} ${showBalance(
                                token as Token,
                        )}`}
                      >
                        <div
                          className={`
                      transfer-asset__amount
                      ${
                                  hideBalance.isHidden
                                    ? 'transfer-asset__amount--hidden'
                                    : ''
                              }
                    `}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'start' }}
                        >
                          {!hideBalance.isHidden ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'start' }}>
                              <div style={{ padding: '4px 10px' }}>{amount}</div>

                            </div>
                          ) : (
                            <div>
                              <div />
                              <div />
                              <div />
                              <div />
                              <div />
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                    <div className="transfer-asset__date">
                      {formatDate(timestamp)}
                    </div>
                  </div>
                  <div className="transfer-asset__info" style={{ position: 'absolute', right: '5%' }}>
                    <div className="transfer-asset__indicator">
                      <Uik.Icon
                        className="transfer-asset__indicator-icon"
                        icon={faArrowDown}
                      />
                    </div>
                  </div>
                </div>
                <Uik.Text text="Transfer Details" type="light" className="mt-2" />
                <div className="transfer-asset__block my-2">
                  <div className="transfer-detail">
                    <div className="my-auto mx-2 fs-6">

                      <div className="transfer-asset__wallet">
                        <span className="transfer-asset__wallet-address">
                          {shortAddress(from)}
                        </span>
                      </div>
                    </div>
                    <div className="transfer-asset__direction-indicator" />
                    <div className="my-auto mx-2 fs-6">

                      <div className="transfer-asset__wallet">
                        <span className="transfer-asset__wallet-address">
                          {shortAddress(to)}
                        </span>
                      </div>

                    </div>
                  </div>
                </div>

                <Uik.Button text="Details" onClick={() => window.open(url, '_blank')} />

              </div>
            </div>
          )}
        </div>
      </div>
    </OverlayAction>
  );
};

export default ActivityDetails;
