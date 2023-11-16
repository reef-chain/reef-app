import { Components, hooks } from '@reef-chain/react-lib'
import Uik from '@reef-chain/ui-kit';
import React from 'react'
import {network} from "@reef-chain/util-lib";
import { useHistory } from 'react-router-dom';

const {OverlayAction} = Components;

interface Props{
    isOpen:boolean;
    onClose:(()=>void)|undefined;
}

function RedirectingToPool({isOpen,onClose}:Props) {

    const contractEvents = hooks.useObservableState(network.getLatestBlockContractEvents$()) as []|undefined;

    const history = useHistory();
    
    if(contractEvents && contractEvents.length){
        if(contractEvents.length>=3){
            history.push(`/chart/${contractEvents[contractEvents.length-1]}/trade`);
            if(onClose)onClose();
        }
    }

  return (
    <OverlayAction isOpen={isOpen} onClose={onClose} title='Redirecting to pool Details' className='overlay-swap create-pool'>
        <div className="pool-actions-redirecting">
    <div className="pool-actions-redirecting__animation">
      <Uik.FishAnimation />
      <Uik.FishAnimation />
    </div>
    <Uik.Text text="We're redirecting you to the pool details!." />
    <Uik.Text type="mini" text="This process usually takes up to one minute." />
  </div>
    </OverlayAction>
  )
}

export default RedirectingToPool