import React, { useState } from 'react';
import Uik from '@reef-chain/ui-kit';
import { utils, hooks } from '@reef-chain/react-lib';
import { faRepeat, faCoins, faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons';
import Identicon from '@polkadot/react-identicon';
import axios from 'axios';
import { Tabs, Tokens } from './PoolTransactions';
import { localizedStrings as strings } from '../../../l10n/l10n';

const { formatAgoDate, formatAmount, shortAddress } = utils;
const {
  usePoolTransactionCountSubscription,
  usePoolTransactionSubscription,
} = hooks;

export interface Props {
  tab: Tabs,
  address: string,
  reefscanUrl: string,
  tokens?: Tokens
}

const icons = {
  Swap: {
    icon: faRepeat,
    type: 'trade',
  },
  Mint: {
    icon: faCoins,
    type: 'stake',
  },
  Burn: {
    icon: faArrowUpFromBracket,
    type: 'unstake',
  },
};

const Transactions = ({
  tab, address, reefscanUrl, tokens,
}: Props): JSX.Element => {
  const [pageIndex, setPageIndex] = useState(0);

  const { loading: loadingTransactions, data: transactionData } = usePoolTransactionSubscription(address, tab, pageIndex, 10, axios);
  const { data } = usePoolTransactionCountSubscription(address, tab, axios);

  const maxPage = data
    ? Math.ceil(data.poolEventsConnection.totalCount / 10)
    : 1;

  const getType = (poolType: Tabs, amount_1: number, tokenSymbol1: string, tokenSymbol2: string): string => {
    switch (poolType) {
      case 'Swap': return `Traded ${amount_1 > 0 ? tokenSymbol1 : tokenSymbol2} for ${amount_1 > 0 ? tokenSymbol2 : tokenSymbol1}`;
      case 'Burn': return 'Unstaked';
      case 'Mint': return 'Staked';
      default: return '';
    }
  };

  if (loadingTransactions || !transactionData) {
    return (<div />);
  }

  if (!transactionData?.poolEvents.length) {
    return (
      <Uik.Text type="light">It appears there&apos;s no transactions in this category</Uik.Text>
    );
  }

  return (
    <Uik.Table
      seamless
      pagination={{
        count: maxPage,
        current: pageIndex + 1,
        onChange: (page) => { setPageIndex(page - 1); },
      }}
    >
      <Uik.THead>
        <Uik.Tr>
          <Uik.Th>{strings.type}</Uik.Th>
          <Uik.Th>{strings.account}</Uik.Th>
          <Uik.Th align="center">{strings.time}</Uik.Th>
          <Uik.Th align="right">
            { tokens?.firstToken?.symbol }
            {' '}
            {strings.amount}
          </Uik.Th>
          <Uik.Th align="right">
            { tokens?.secondToken?.symbol }
            {' '}
            {strings.amount}
          </Uik.Th>
        </Uik.Tr>
      </Uik.THead>

      <Uik.TBody>
        {
            transactionData.poolEvents.map(({
              id,
              amount1,
              amount2,
              timestamp,
              toAddress,
              senderAddress,
              blockHeight,
              indexInBlock,
              type: transactionType,
              amountIn1,
              amountIn2,
              signerAddress,
              pool: {
                token1: {
                  decimals: decimals1,
                  symbol: symbol1,
                },
                token2: {
                  decimals: decimals2,
                  symbol: symbol2,
                },
              },
            }) => (
              <Uik.Tr
                key={id}
                onClick={() => window.open(`${reefscanUrl}/extrinsic/${blockHeight}/${indexInBlock}`)}
              >
                <Uik.Td>
                  <Uik.Icon
                    icon={icons[transactionType].icon}
                    className={`
                      pool-transactions__transaction-icon
                      pool-transactions__transaction-icon--${icons[transactionType].type}
                    `}
                  />
                  <span>{ getType(transactionType, amount1, symbol1, symbol2) }</span>
                </Uik.Td>

                <Uik.Td>
                  <a
                    href={`${reefscanUrl}/account/${toAddress || senderAddress || signerAddress}`}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    rel="noreferrer"
                  >
                    <Identicon value={signerAddress} size={18} className="pool-transactions__transaction-account-identicon" />
                    <span>
                      { toAddress || senderAddress || signerAddress
                        ? shortAddress(toAddress || senderAddress || signerAddress)
                        : 'Unknown' }
                    </span>
                  </a>
                </Uik.Td>

                <Uik.Td align="center">{ formatAgoDate(timestamp) }</Uik.Td>

                <Uik.Td align="right">{formatAmount(amount1 > 0 ? amount1 : amountIn1, decimals1)}</Uik.Td>

                <Uik.Td align="right">{formatAmount(amount2 > 0 ? amount2 : amountIn2, decimals2)}</Uik.Td>
              </Uik.Tr>
            ))
          }
      </Uik.TBody>
    </Uik.Table>
  );
};

export default Transactions;
