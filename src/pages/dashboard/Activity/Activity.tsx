import { REEF_TOKEN, createEmptyTokenWithAmount, hooks } from '@reef-chain/react-lib';
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
import NftActivityItem from './NftActivityItem';
import { Network } from '@reef-chain/util-lib/dist/dts/network';
import axios from 'axios';
import {BigNumber} from 'ethers';

const noActivityTokenDisplay = createEmptyTokenWithAmount();
noActivityTokenDisplay.address = '0x';
noActivityTokenDisplay.iconUrl = '';
noActivityTokenDisplay.name = 'No account history yet.';

interface CummulativeTransfers extends tokenUtil.TokenTransfer{
  isSwap: boolean;
  token1?:tokenUtil.TokenTransfer;
  token2?:tokenUtil.TokenTransfer;
  fees?:tokenUtil.TokenTransfer;
  isNftBuyOperation?: boolean;
  isNftSellOperation?: boolean;
}

export interface SwapPair {
  pair:string;
  token1: tokenUtil.TokenTransfer;
  token2: tokenUtil.TokenTransfer;
  fees: tokenUtil.TokenTransfer;
  isNftBuyOperation?:boolean;
}

const fetchFees = async (blockId:string,index:number,nwContext:Network)=>{
  const query = `query MyQuery {
    transfers(where: {blockHash_contains: "${blockId}", AND: {extrinsicIndex_eq: ${index}}}, limit: 1) {
      signedData
    }
  }
  `
 const response = await axios.post(nwContext.graphqlExplorerUrl.replace('wss','https'),{query});

return BigNumber.from(response.data.data.transfers[0].signedData.fee.partialFee);
}

const parseTokenTransfers = async(transfers:tokenUtil.TokenTransfer[],nwContext:Network):Promise<CummulativeTransfers[]> => {
  const updatedTxArray: CummulativeTransfers[] = [];
  const swapsIdx = [-1];
  const nftPurchasesIdx = [-1];
  const nftSalesIdx = [-1];
  const updatedTxIdx = [-1];

  for(let idx=0;idx<transfers.length;idx++){
    const tx = transfers[idx];
    if (tx.reefswapAction === 'Swap' && !swapsIdx.includes(idx)) {
      swapsIdx.push(idx);
      const swapPair = transfers.find((t) => t.extrinsic.id === tx.extrinsic.id && t.reefswapAction === 'Swap' && t.token !== tx.token);
      const swapPairIdx = transfers.indexOf(swapPair!);
      swapsIdx.push(swapPairIdx);
      const feesIdx = swapPairIdx + 1;
      swapsIdx.push(feesIdx);
      if (feesIdx <= transfers.length) {
        updatedTxArray.push({
          isSwap: true,
          token1: tx,
          token2: swapPair!,
          fees: transfers[feesIdx],
          timestamp: tx.timestamp,
        } as CummulativeTransfers);
        updatedTxIdx.push(idx);
      }
    } else if (tx.reefswapAction === 'Swap' || swapsIdx.includes(idx) || nftPurchasesIdx.includes(idx)|| nftSalesIdx.includes(idx)) {
      // @ts-ignore
    }
    else {
      if(tx.type === "ERC1155"){
        // buying nft or receiving
        if(tx.inbound){
          // bought / minted
          if(tx.from == "0x"){
            const nftBuyPairs:any = [];
            for (const transfer of transfers) {
                if (transfer.extrinsic.id === tx.extrinsic.id && transfer.token !== tx.token && tx.to == transfer.from) {
                    nftBuyPairs.push(transfer);
                }
            }
            for (const nftBuyPair of nftBuyPairs) {
              const idx = transfers.indexOf(nftBuyPair);
              nftPurchasesIdx.push(idx);
            }

            if(nftBuyPairs.length){
              // purchased NFT
              const fees = await fetchFees(nftBuyPairs[0].extrinsic.blockId,nftBuyPairs[0].extrinsic.index,nwContext);

              if(fees){
                const feesToken = {
                  'token':{
                    ...REEF_TOKEN,
                    balance:fees,
                  }
                };

                updatedTxArray.push({
                  isNftBuyOperation: true,
                  token1: tx,
                  token2: nftBuyPairs[0],
                  fees: feesToken,
                  timestamp: tx.timestamp,
                } as CummulativeTransfers);
              }else{
                updatedTxArray.push({
                  isSwap: false,
                 ...tx,
                } as CummulativeTransfers);
              }
              updatedTxIdx.push(idx);
            }
          }else{
            // received NFT
            updatedTxArray.push({
              ...tx,
              isSwap: false,
            });
            updatedTxIdx.push(idx);
          }
        }
        // selling or sending nft
        else{
          const nftSellPairs:any = [];
            for (const transfer of transfers) {
                if (transfer.extrinsic.id === tx.extrinsic.id && transfer.token !== tx.token) {
                  nftSellPairs.push(transfer);
                }
            }

            // sold nft
            if(tx.to=="0x"){
              if(nftSellPairs.length){
                updatedTxArray.push({
                  ...tx,
                  isSwap: false,
                  isNftSellOperation:true,
                });

              }else{
                updatedTxArray.push({
                  ...tx,
                  isSwap: false,
                });
              }
              updatedTxIdx.push(idx);
            }
            // sent nft
            else{
              updatedTxArray.push({
                ...tx,
                isSwap: false,
              });
              updatedTxIdx.push(idx);
            }
        }
      }
    }
  }

  for(let i=0;i<transfers.length;i++){
    if(!swapsIdx.includes(i) && !nftPurchasesIdx.includes(i) && !nftSalesIdx.includes(i) && !updatedTxIdx.includes(i)){
        updatedTxArray.push({
          ...transfers[i],
          isSwap: false,
        });
    }
  }
  //@ts-ignore
  updatedTxArray.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return updatedTxArray.reverse().slice(0, 10);
};

export const Activity = (): JSX.Element => {
  const [unparsedTransfers, loading] :[tokenUtil.TokenTransfer[], boolean] = hooks.useTxHistory();
  const [transfers, setTransfers] = useState([]);
  const {network:nwContext} = useContext(ReefSigners);

  useEffect(() => {
    const parseTokens = async()=>{
      const parsedTxs = await parseTokenTransfers(unparsedTransfers,nwContext);
      setTransfers(parsedTxs as any);
    }
    parseTokens();
  }, [unparsedTransfers,nwContext]);

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
              if (item.isNftBuyOperation) {
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
                        isNftBuyOperation: item.isNftBuyOperation,
                      } as SwapPair);
                      setSwapActivityModalOpen(!isSwapActivityModalOpen);
                      console.log(item.timestamp)
                    }}
                  >
                    <NftActivityItem fees={item.fees!} token1={item.token1!} token2={item.token2!} isBought = {true}/>
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
                    isNftSellOperation={item.isNftSellOperation}
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
