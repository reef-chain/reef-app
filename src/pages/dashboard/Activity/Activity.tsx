import { createEmptyTokenWithAmount, hooks } from '@reef-chain/react-lib';
import Uik from '@reef-chain/ui-kit';
import React, { useContext, useEffect, useState } from 'react';
import './activity.css';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { tokenUtil } from '@reef-chain/util-lib';
import ActivityItem, { Skeleton } from './ActivityItem';
import { localizedStrings as strings } from '../../../l10n/l10n';
import ActivityDetails from './ActivityDetails';
import ReefSigners from '../../../context/ReefSigners';
import SwapActivityItem from './SwapActivityItem';
import SwapActivityDetails from './SwapActivityDetails';

const noActivityTokenDisplay = createEmptyTokenWithAmount();
noActivityTokenDisplay.address = '0x';
noActivityTokenDisplay.iconUrl = '';
noActivityTokenDisplay.name = 'No account history yet.';

interface CummulativeTransfers extends tokenUtil.TokenTransfer{
  isSwap: boolean;
  token1?:tokenUtil.TokenTransfer;
  token2?:tokenUtil.TokenTransfer;
  fees?:tokenUtil.TokenTransfer;
}

export interface SwapPair {
  pair:string;
  token1: tokenUtil.TokenTransfer;
  token2: tokenUtil.TokenTransfer;
  fees: tokenUtil.TokenTransfer;
}

const parseTokenTransfers = (transfers:tokenUtil.TokenTransfer[]):CummulativeTransfers[] => {
  const updatedTxArray: CummulativeTransfers[] = [];
  const swapsIdx = [-1];

  transfers.forEach((tx, idx) => {
    if (tx.reefswapAction === 'Swap' && !swapsIdx.includes(idx)) {
      swapsIdx.push(idx);
      const swapPair = transfers.find((t) => t.extrinsic.id === tx.extrinsic.id && t.reefswapAction === 'Swap' && t.token !== tx.token);
      const swapPairIdx = transfers.indexOf(swapPair!);
      swapsIdx.push(swapPairIdx);
      const feesIdx = swapPairIdx + 1;
      if (feesIdx <= transfers.length) {
        swapsIdx.push(feesIdx);
        updatedTxArray.push({
          isSwap: true,
          token1: tx,
          token2: swapPair!,
          fees: transfers[feesIdx],
        } as CummulativeTransfers);
      }
    } else if (tx.reefswapAction === 'Swap' || swapsIdx.includes(idx)) {
      // @ts-ignore
    } else {
      updatedTxArray.push({
        ...tx,
        isSwap: false,
      });
    }
  });
  return updatedTxArray.slice(0, 10);
};

export const Activity = (): JSX.Element => {
  const [unparsedTransfers, loading] :[tokenUtil.TokenTransfer[], boolean] = hooks.useTxHistory();
  const [transfers, setTransfers] = useState([]);

  useEffect(() => {
    setTransfers(parseTokenTransfers(unparsedTransfers));
  }, [unparsedTransfers]);

  const {
    selectedSigner, network,
  } = useContext(ReefSigners);

  const [isActivityModalOpen, setActivityModalOpen] = useState(false);
  const [isSwapActivityModalOpen, setSwapActivityModalOpen] = useState(false);

  const [selectedTransaction, setSelectedTransaction] = useState<tokenUtil.TokenTransfer|null>(null);

  // set current transaction as parameter and call setSelectedTransaction state function.
  const setCurrentTransaction = (transaction : tokenUtil.TokenTransfer): void => {
    setSelectedTransaction(transaction);
  };

  const [swapPair, setSwapPair] = useState<SwapPair|undefined>(undefined);

  // @ts-ignore
  return (
    <div className="token-activity activity">
      <div className="activity__head">
        <Uik.Text type="title" text={strings.activity} className="activity__title" />
        {
          !!selectedSigner?.address && !!network?.reefscanUrl
          && (
          <Uik.Button
            size="small"
            icon={faArrowUpRightFromSquare}
            text={strings.open_explorer}
            onClick={() => window.open(`${network?.reefscanUrl}/account/${selectedSigner.address}`)}
          />
          )
        }
      </div>

      <div className={`col-12 card  ${transfers?.length ? 'card-bg-light' : ''}`}>
        {!!transfers && !transfers.length && !loading && <div className="no-token-activity">{strings.no_recent_transfer}</div>}
        {!!transfers && !transfers.length && loading && (
        <div className="no-token-activity">
          <Uik.Container vertical>
            <Uik.Loading size="small" />
          </Uik.Container>
        </div>
        )}
        {!!transfers && !!transfers.length && (
          <div>

            {transfers.map((item, index) => {
              if (item.isSwap) {
                // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                return (
                  <div
                    role="button"
                    key={`item-wrapper-${item.timestamp + index.toString()}`}
                    onClick={() => {
                      setSwapPair({
                        pair: `${item.token1!.token.name}-${item.token2!.token.name}`,
                        token1: item.token1,
                        token2: item.token2,
                        fees: item.fees,
                      } as SwapPair);
                      setSwapActivityModalOpen(!isSwapActivityModalOpen);
                    }}
                  >
                    <SwapActivityItem fees={item.fees!} token1={item.token1!} token2={item.token2!} />
                  </div>
                );
              }
              return (
              // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                <div
                  key={`item-wrapper-${item.timestamp + index.toString()}`}
                  onClick={() => {
                    setCurrentTransaction(item);
                    setActivityModalOpen(!isActivityModalOpen);
                  }}
                >
                  <ActivityItem
                    key={item.timestamp + index.toString()}
                    timestamp={item.timestamp}
                    token={item.token}
                    inbound={item.inbound}
                  />
                </div>
              );
            })}
          </div>
        )}
        {!transfers && (
          <>
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </>
        ) }
      </div>

      {!!transfers && !!transfers.length && selectedTransaction && (
        <ActivityDetails
          isOpen={isActivityModalOpen}
          onClose={() => setActivityModalOpen(false)}
          timestamp={selectedTransaction.timestamp}
          from={selectedTransaction.from}
          to={selectedTransaction.to}
          url={selectedTransaction.url}
          inbound={selectedTransaction.inbound}
          token={selectedTransaction.token}
        />
      )}
      {!!transfers && !!transfers.length && isSwapActivityModalOpen && (
        <SwapActivityDetails isOpen={isSwapActivityModalOpen} onClose={() => setSwapActivityModalOpen(false)} swapPair={swapPair!} />
      )}
    </div>
  );
};
