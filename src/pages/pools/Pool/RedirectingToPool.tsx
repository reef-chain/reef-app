import { Components } from '@reef-chain/react-lib'
import Uik from '@reef-chain/ui-kit';
import React from 'react'

const {OverlayAction} = Components;

interface Props{
    isOpen:boolean;
    onClose:(()=>void)|undefined;
}

function RedirectingToPool({isOpen,onClose}:Props) {
  return (
    <OverlayAction isOpen={isOpen} onClose={onClose} title='Redirecting to pool Details'>
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