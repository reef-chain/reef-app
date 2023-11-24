import { hooks } from '@reef-chain/react-lib';
import Uik from '@reef-chain/ui-kit';
import React, { useContext, useState } from 'react';
import { network } from '@reef-chain/util-lib';
import PoolContext from '../../../context/PoolContext';
import { useHistory } from 'react-router-dom';
import './redirecting.css';

function RedirectingToPool():JSX.Element {
  const contractEvents = hooks.useObservableState(network.getLatestBlockContractEvents$()) as []|undefined;
  const [poolAddress,setPoolAddress]=useState<string|undefined>();
  const pools = useContext(PoolContext);

  const history = useHistory();
  
  if(poolAddress){
    const poolAddresses = pools.map(p=>p.address);
    if(poolAddresses.includes(poolAddress)){
      history.push(`/chart/${poolAddress}/trade`);
    }
  }

  if (!poolAddress && contractEvents && contractEvents.length) {
    if (contractEvents.length >= 3) {
      const _poolAddress = contractEvents[contractEvents.length - 1];
      setPoolAddress(_poolAddress);
    }
  }

  return (
    <div className="pool-actions-redirecting">
      <div className="pool-actions-redirecting__animation">
        <Uik.FishAnimation />
        <Uik.FishAnimation />
      </div>
      <Uik.Text text="We're redirecting you to the pool details!." />
      <Uik.Text type="mini" text="This process usually takes up to one minute." />
    </div>
  );
}

export default RedirectingToPool;
