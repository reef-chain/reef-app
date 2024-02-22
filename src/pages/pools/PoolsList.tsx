import { faArrowUpFromBracket, faCoins, faRepeat } from '@fortawesome/free-solid-svg-icons';
import { hooks, Token } from '@reef-chain/react-lib';
import Uik from '@reef-chain/ui-kit';
import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import BigNumber from 'bignumber.js';
import axios, { AxiosInstance } from 'axios';
import TokenPricesContext from '../../context/TokenPricesContext';
import { POOL_CHART_URL } from '../../urls';
import './pools.css';
import PoolsSearch from './PoolsSearch';
import { localizedStrings } from '../../l10n/l10n';
import ReefSigners from '../../context/ReefSigners';

export interface Props {
  tokens: Token[]
}

const PoolsList = ({ tokens }: Props): JSX.Element => {
  const pageCount = 10;
  const [currentPage, changePage] = useState(1);
  const [changedPage, setChangedPage] = useState(false);
  const [search, setSearch] = useState('');
  const tokenPrices = useContext(TokenPricesContext);
  const httpClient: AxiosInstance = axios;

  const signer = useContext(ReefSigners).selectedSigner;
  const [pools, , count] = hooks.usePoolsList({
    limit: pageCount,
    offset: (currentPage - 1) * pageCount,
    httpClient,
    search,
    signerAddress: signer?.address || '',
    tokenPrices,
    queryType: 'All',
  });

  const history = useHistory();
  const openPool = (
    address: string,
    action: 'trade' | 'stake' | 'unstake' = 'trade',
  ): void => history.push(
    POOL_CHART_URL
      .replace(':address', address)
      .replace(':action', action),
  );

  interface TableToken {
    name?: string
    image?: string
    address?:string
  }

  const hasToken = ({ address }: TableToken = {}): boolean => {
    const token = tokens.find((tkn: Token) => tkn.address === address);
    if (!token) return false;

    const hasBalance = (new BigNumber(token.balance.toString())).toNumber() > 0;
    return hasBalance;
  };

  const canStake = ({
    token1,
    token2,
  }: {
    token1?: TableToken
    token2?: TableToken
  } = {}): boolean => hasToken(token1) && hasToken(token2);

  const canTrade = ({
    token1,
    token2,
  }: {
    token1?: TableToken
    token2?: TableToken
  } = {}): boolean => hasToken(token1) || hasToken(token2);

  if (
    !pools.length
    && !search
    && !changedPage
  ) return (<></>);

  return (
    <div className="pools__list pools__list--all">
      <div className="pools__table-top">
        <Uik.Text type="title">{localizedStrings.pools}</Uik.Text>
        <PoolsSearch
          value={search}
          onInput={(value) => { setSearch(value); }}
        />
      </div>

      <Uik.Table
        seamless
        pagination={{
          count: Math.ceil(count / pageCount),
          current: currentPage,
          onChange: (page) => { changePage(page); setChangedPage(true); },
        }}
      >
        <Uik.THead>
          <Uik.Tr>
            <Uik.Th>{localizedStrings.pair}</Uik.Th>
            <Uik.Th align="right">{localizedStrings.tvl}</Uik.Th>
            <Uik.Th align="right">{localizedStrings.vol}</Uik.Th>
            <Uik.Th align="right">{localizedStrings.vol_percentage}</Uik.Th>
            <Uik.Th />
          </Uik.Tr>
        </Uik.THead>

        <Uik.TBody>
          {
                pools.map((item) => (
                  <Uik.Tr
                    key={`pool-${item.address}`}
                    onClick={() => openPool(item.address)}
                  >
                    <Uik.Td>
                      <div className="pools__pair">
                        <img src={item.token1.image} alt={item.token1.name} />
                        <img src={item.token2.image} alt={item.token1.name} />
                      </div>
                      <span>
                        { item.token1.name }
                        {' '}
                        -
                        {' '}
                        { item.token2.name }
                      </span>
                    </Uik.Td>
                    <Uik.Td align="right">
                      $
                      {' '}
                      { Uik.utils.formatHumanAmount(item.tvl || '') }
                    </Uik.Td>
                    <Uik.Td align="right">
                      $
                      {' '}
                      { Uik.utils.formatHumanAmount(item.volume24h || '') }
                    </Uik.Td>
                    <Uik.Td align="right">
                      <Uik.Trend
                        type={item.volumeChange24h >= 0 ? 'good' : 'bad'}
                        direction={item.volumeChange24h >= 0 ? 'up' : 'down'}
                        text={`${item.volumeChange24h.toFixed(2)}%`}
                      />
                    </Uik.Td>
                    <Uik.Td align="right">
                      {
                        !!item.myLiquidity
                        && (
                        <Uik.Button
                          text={localizedStrings.unstake}
                          icon={faArrowUpFromBracket}
                          fill
                          onClick={(e) => {
                            e.stopPropagation();
                            openPool(item.address || '', 'unstake');
                          }}
                        />
                        )
                      }
                      {
                        canStake(item)
                        && (
                          <Uik.Button
                            text={localizedStrings.stake}
                            icon={faCoins}
                            fill
                            onClick={(e) => {
                              e.stopPropagation();
                              openPool(item.address || '', 'stake');
                            }}
                          />
                        )
                      }
                      {
                        !canStake(item) && canTrade(item)
                        && (
                          <Uik.Button
                            text="Trade"
                            icon={faRepeat}
                            fill
                            onClick={(e) => {
                              e.stopPropagation();
                              openPool(item.address || '', 'trade');
                            }}
                          />
                        )
                      }
                    </Uik.Td>
                  </Uik.Tr>
                ))
              }
        </Uik.TBody>
      </Uik.Table>
    </div>
  );
};

export default PoolsList;
