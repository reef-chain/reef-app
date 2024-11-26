import { hooks } from '@reef-chain/react-lib';
import Uik from '@reef-chain/ui-kit';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { BigNumber } from 'ethers';
import axios from 'axios';
import TokenPricesContext from '../../../context/TokenPricesContext';
import Actions, { ActionTabs } from './Actions';
import Chart, { TimeData, Timeframe } from './Chart';
import './pool.css';
import Stats from './Stats';
import ReefSigners from '../../../context/ReefSigners';
import { appAvailableNetworks } from '../../../environment';
import NetworkSwitch from '../../../context/NetworkSwitch';
import { DASHBOARD_URL } from '../../../urls';

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
  const [timeframe, setTimeframe] = useState<Timeframe>('day');
  const { network,reefState } = useContext(ReefSigners);
  const [poolUpdatedAt,setPoolUpdatedAt] = useState<string>("");

  const networkSwitch = useContext(NetworkSwitch);
  const history = useHistory();

  const timeData = timeframeToTimeData(timeframe);

  const { selectedSigner: signer, network: nw } = useContext(ReefSigners);

  const [poolDetails] = hooks.usePoolInfo(
    address,
    signer?.address || '',
    tokenPrices,
    axios,
  );

  const {data:poolInfo,status:doesPoolExist} = poolDetails;

  const tokenPrice1 = (doesPoolExist && poolInfo ? tokenPrices[poolInfo.firstToken.address] : 0) || 0;
  const tokenPrice2 = (poolInfo && doesPoolExist ? tokenPrices[poolInfo.secondToken.address] : 0) || 0;
  const decimals1 = (poolInfo && doesPoolExist? poolInfo.firstToken.decimals : 0) || 0;
  const decimals2 = (poolInfo && doesPoolExist ? poolInfo.firstToken.decimals : 0) || 0;


  const [poolData] = hooks.usePoolData({
    address,
    decimals1,
    decimals2,
    price1: tokenPrice1,
    price2: tokenPrice2,
    timeData,
    poolUpdatedAt
  }, axios);

  useEffect(()=>{
    setPoolUpdatedAt(Date.now().toString())
  },[poolInfo])

  const selectNetwork = (key: 'mainnet' | 'testnet'): void => {
    const toSelect = appAvailableNetworks.find((item) => item.name === key);
    networkSwitch.setSwitching(true);
    history.push(`/chart/${address}/${action}`);

    if (toSelect) {
      reefState.setSelectedNetwork(toSelect);
    }
  };

  if(!doesPoolExist){
    return <div className='no-pool'>
      <Uik.Text text="No Pool found!" type="light" className="mb-2 no-pool__title"/>
      <Uik.Text text={`This pool doesn't exist on ${network?.name.charAt(0).toUpperCase() + network?.name.slice(1)}, kindly switch to ${network?.name=="mainnet"?"Testnet":"Mainnet"}.`} className="mb-2" type="light" />
      <Uik.Button fill text={`Switch to ${network?.name=="mainnet"?"Testnet":"Mainnet"}`} onClick={()=>selectNetwork(network?.name=="mainnet"?"testnet":"mainnet")}/>
    </div>
  }
  
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
          lastUpdatedOn={poolUpdatedAt}
        />
      </div> 
    </div>
  );
};

export default Pool;
