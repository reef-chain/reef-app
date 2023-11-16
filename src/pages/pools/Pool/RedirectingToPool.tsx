import { hooks } from '@reef-chain/react-lib'
import Uik from '@reef-chain/ui-kit';
import React from 'react'
import {network} from "@reef-chain/util-lib";
import { useHistory } from 'react-router-dom';
import "./redirecting.css"

interface Props{
    onClose:(()=>void)|undefined;
}

function RedirectingToPool({onClose}:Props) {

    const contractEvents = hooks.useObservableState(network.getLatestBlockContractEvents$()) as []|undefined;

    const history = useHistory();
    
    if(contractEvents && contractEvents.length){
        if(contractEvents.length>=3){
            const poolAddress = contractEvents[contractEvents.length-1]
            history.push(`/chart/${poolAddress}/trade`);
            if(onClose)onClose();
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
  )
}

export default RedirectingToPool