import { createEmptyTokenWithAmount, hooks, Token, TokenTransfer, TransferExtrinsic } from '@reef-chain/react-lib';
import Uik from '@reef-chain/ui-kit';
import React, { useContext, useState } from 'react';
import './activity.css';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import ActivityItem, { Skeleton } from './ActivityItem';
import { localizedStrings as strings } from '../../../l10n/l10n';
import ActivityDetails from './ActivityDetails';
import ReefSigners from '../../../context/ReefSigners';
import SwapActivityItem from './SwapActivityItem';

const noActivityTokenDisplay = createEmptyTokenWithAmount();
noActivityTokenDisplay.address = '0x';
noActivityTokenDisplay.iconUrl = '';
noActivityTokenDisplay.name = 'No account history yet.';

interface CummulativeTransfers extends TokenTransfer{
  isSwap: boolean;
  token1?:TokenTransfer;
  token2?:TokenTransfer;
  fees?:TokenTransfer;
}

const parseTokenTransfers = (transfers:TokenTransfer[]):CummulativeTransfers[]=>{
  const updatedTxArray: CummulativeTransfers[] = [];
  const swapsIdx = [-1];

  transfers.forEach((tx,idx)=>{
    if(tx.reefswapAction==='Swap' && !swapsIdx.includes(idx)){
      swapsIdx.push(idx);
      const swapPair = transfers.find(t=>t.extrinsic.id==tx.extrinsic.id && t.reefswapAction==='Swap' && t.token!=tx.token)
      const swapPairIdx = transfers.indexOf(swapPair!);
      swapsIdx.push(swapPairIdx);
      const feesIdx =swapPairIdx+1;
      if(feesIdx<=transfers.length){
        swapsIdx.push(feesIdx);
        updatedTxArray.push({
          isSwap: true,
          token1:tx,
          token2:swapPair!,
          fees:transfers[feesIdx]
        } as CummulativeTransfers) 
      }
    }else if(tx.reefswapAction==='Swap' || swapsIdx.includes(idx)){}
    else{
      updatedTxArray.push({
        ...tx,
        isSwap:false
      })
    }
  })
  return updatedTxArray;
}

export const Activity = (): JSX.Element => {
  const [unparsedTransfers, loading] :[TokenTransfer[], boolean] = hooks.useTxHistory();

  const transfers = parseTokenTransfers(unparsedTransfers);
  console.log(transfers)
  const {
    selectedSigner, network,
  } = useContext(ReefSigners);

  const [isActivityModalOpen, setActivityModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TokenTransfer|null>(null);

  // set current transaction as parameter and call setSelectedTransaction state function.
  const setCurrentTransaction = (transaction : TokenTransfer): void => {
    setSelectedTransaction(transaction);
  };

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
        {/*{!!transfers && !transfers.length && !loading && <div className="no-token-activity">{strings.no_recent_transfer}</div>}*/}
        {!!transfers && !transfers.length && !loading && network.name !== 'mainnet' && <div className="no-token-activity">{strings.no_recent_transfer}</div>}
        {!!transfers && !transfers.length && !loading && network.name === 'mainnet' && (
        <div className="no-token-activity">
          Please use&nbsp;
           <a target="_blank"
            href={`${network?.reefscanUrl}/account/${selectedSigner?.address}`}
          >reefscan account activity</a>&nbsp;
          while indexer is being updated.
        </div>
        )}

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
              if(item.isSwap){
                return <SwapActivityItem fees={item.fees!} token1={item.token1!} token2={item.token2!} />
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
            )})}
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
    </div>
  );
};
