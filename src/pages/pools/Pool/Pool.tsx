import { hooks } from '@reef-chain/react-lib';
import Uik from '@reef-chain/ui-kit';
import React, { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BigNumber } from 'ethers';
import axios from 'axios';
import TokenPricesContext from '../../../context/TokenPricesContext';
import Actions, { ActionTabs } from './Actions';
import Chart, { TimeData, Timeframe } from './Chart';
import './pool.css';
import Stats from './Stats';
import ReefSigners from '../../../context/ReefSigners';

interface Params {
  address: string;
  action: ActionTabs;
}
interface Time {
  time: Date;
}

// eslint-disable-next-line
const timeToNumber = <T extends Time>(obj: T) => ({
  ...obj,
  time: obj.time.getTime() / 1000,
});

const timeframeToTimeData = (timeframe: Timeframe): TimeData => {
  switch (timeframe) {
    case 'hour':
      return { timeUnit: 'Minute', timeSpan: 60 };
    case 'day':
      return { timeUnit: 'Hour', timeSpan: 24 };
    case 'week':
      return { timeUnit: 'Hour', timeSpan: 7 * 24 };
    case 'month':
      return { timeUnit: 'Day', timeSpan: 31 };
    default:
      return { timeUnit: 'Hour', timeSpan: 24 };
  }
};

const Pool = (): JSX.Element => {
  const { address, action } = useParams<Params>();
  const tokenPrices = useContext(TokenPricesContext);

  const { selectedSigner: signer, network: nw } = useContext(ReefSigners);

  const [poolInfo] = hooks.usePoolInfo(
    address,
    signer?.address || '',
    tokenPrices,
    axios,
  );

  const tokenPrice1 = (poolInfo ? tokenPrices[poolInfo.firstToken.address] : 0) || 0;
  const tokenPrice2 = (poolInfo ? tokenPrices[poolInfo.secondToken.address] : 0) || 0;
  const decimals1 = (poolInfo ? poolInfo.firstToken.decimals : 0) || 0;
  const decimals2 = (poolInfo ? poolInfo.firstToken.decimals : 0) || 0;

  const [timeframe, setTimeframe] = useState<Timeframe>('day');

  const [poolData] = hooks.usePoolData({
    address,
    decimals1,
    decimals2,
    price1: tokenPrice1,
    price2: tokenPrice2,
    timeData: timeframeToTimeData(timeframe),
  }, axios);

  if (!poolInfo) {
    return <Uik.Loading />;
  }

  return (
    <div className="pool">
      <Stats
        data={poolInfo}
        price1={tokenPrice1}
        price2={tokenPrice2}
        reefscanUrl={nw.reefscanUrl}
      />

      <div className="pool__content">
        <Actions
          tab={action}
          poolAddress={address}
          token1={{
            address: poolInfo.firstToken.address,
            name: poolInfo.firstToken.name,
            symbol: poolInfo.firstToken.symbol,
            iconUrl: poolInfo.firstToken.icon,
            balance: BigNumber.from(0),
            decimals: decimals1,
          }}
          token2={{
            address: poolInfo.secondToken.address,
            name: poolInfo.secondToken.name,
            symbol: poolInfo.secondToken.symbol,
            iconUrl: poolInfo.secondToken.icon,
            balance: BigNumber.from(0),
            decimals: decimals2,
          }}
        />
        <Chart
          tokens={{
            firstToken: {
              name: poolInfo.firstToken.symbol,
              image: poolInfo.firstToken.icon,
            },
            secondToken: {
              name: poolInfo.secondToken.symbol,
              image: poolInfo.secondToken.icon,
            },
          }}
          data={
            poolData ? {
              fees: poolData.fees.map(timeToNumber),
              tvl: poolData.tvl.map(timeToNumber),
              volume: {
                firstToken: poolData.firstTokenVolume.map(timeToNumber),
                secondToken: poolData.secondTokenVolume.map(timeToNumber),
                total: poolData.volume.map(timeToNumber),
              },
              price: poolData.price.map(timeToNumber),
            }
              : undefined
          }
          timeframe={timeframe}
          setTimeframe={setTimeframe}
        />
      </div>
    </div>
  );
};

export default Pool;
