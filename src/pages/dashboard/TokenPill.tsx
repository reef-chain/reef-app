import { Token, utils, Components } from '@reef-chain/react-lib';
import BigNumber from 'bignumber.js';
import React, { useContext, useMemo } from 'react';
import TokenPricesContext from '../../context/TokenPricesContext';
import { toCurrencyFormat } from '../../utils/utils';
import './TokenPill.css';
import { localizedStrings as strings } from '../../l10n/l10n';

const { showBalance } = utils;
const { Icons: { getIconUrl } } = Components;

interface TokenPill {
  token: Token;
}

export const TokenPill = ({ token }: TokenPill): JSX.Element => {
  const tokenPrices = useContext(TokenPricesContext);

  const price = useMemo(() => tokenPrices[token.address], [tokenPrices]);

  const balanceValue = price
    ? new BigNumber(token.balance.toString())
      .div(new BigNumber(10).pow(token.decimals))
      .multipliedBy(price)
      .toNumber()
    : undefined;
  return (
    <div key={token.address} className="col-md-12 col-lg-6">
      <div className="token-balance-item radius-border d-flex d-flex-space-between d-flex-vert-center">
        <div className="token-balance-item_icon-text mr-1">
          <div className="token-balance-item_icon-text_w mr-1"><img src={token.iconUrl ? token.iconUrl : getIconUrl(token.address)} alt={token.name} /></div>
          <div className="token-balance-item__info">
            <div className="">
              <div className="title-font text-bold ">{token.name}</div>
              <div className="token-balance-item_sub-title">
                <span>{showBalance(token)}</span>

                <span className="token-balance-item__price">
                  {price && toCurrencyFormat(price, { maximumFractionDigits: price! < 1 ? 4 : 2 }) }
                  {!price && <span>{strings.no_pool_data}</span> }
                  {/* TODO {!isDataSet(token.price) && token.price === DataProgress.LOADING && <Loading />} */}
                  {/* TODO {!isDataSet(token.price) && token.price === DataProgress.NO_DATA && ' - '} */}
                </span>
              </div>
            </div>

            <div className="token-balance-item_balances title-font text-bold text-color-dark-accent">
              <div>
                {balanceValue && (
                <div className="token-balance-item__balance">
                  {toCurrencyFormat(balanceValue)}
                </div>
                ) }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
