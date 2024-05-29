import React from 'react'
import Uik from '@reef-chain/ui-kit'

interface Props{
    wcPreloader:boolean;
}

function WcPreloader({wcPreloader}:Props) {
  return (
    <Uik.Modal title="Connecting to Mobile App"
        isOpen={wcPreloader}>
          <div>
          <div className='wc-preloader'>
            <div className='wc-loader'></div>
            <img src="/img/wallets/walletconnect.svg" alt="" className='wc-icon-preloader' />
          </div>
          <div className='wc-loader-label' >
            <Uik.Text type="mini" text="wait while we are establishing a connection"/>
            </div>
          </div>
        </Uik.Modal>
  )
}

export default WcPreloader