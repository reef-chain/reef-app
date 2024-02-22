import { hooks } from '@reef-chain/react-lib';
import Uik from '@reef-chain/ui-kit';
import React, { useContext, useState } from 'react';
import { network } from '@reef-chain/util-lib';
import { useHistory } from 'react-router-dom';
import PoolContext from '../../../context/PoolContext';
import './redirecting.css';

function RedirectingToPool():JSX.Element {
  const contractEvents = hooks.useObservableState(network.getLatestBlockContractEvents$());
  const [poolAddress, setPoolAddress] = useState<string|undefined>();
  const pools = useContext(PoolContext);

  const history = useHistory();

  if (poolAddress) {
    const poolAddresses = pools.map((p) => p.address);
    if (poolAddresses.includes(poolAddress)) {
      history.push(`/chart/${poolAddress}/trade`);
    }
  }

  if (!poolAddress && contractEvents && contractEvents.addresses) {
    if (contractEvents.addresses.length >= 3) {
      // TODO how do we know it's the right pool address?
      const _poolAddress = contractEvents[contractEvents.addresses.length - 1];
      setPoolAddress(_poolAddress);
    }
  }

  return (
    <div className="pool-actions-redirecting">
      <div className="pool-actions-redirecting__animation">
        <Uik.FishAnimation />
        <Uik.FishAnimation />
      </div>
      <Uik.Text text="Registering new pool balances." />
      <Uik.Text type="mini" text="Redirecting to pool details shortly ..." />
    </div>
  );
}

export default RedirectingToPool;
