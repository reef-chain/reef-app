import React from 'react'
import Uik from '@reef-chain/ui-kit'

interface Props{
    wcPreloader:{
        message:string;
        value:boolean;
    };
}

function WcPreloader({wcPreloader}:Props) {
  return (
    <Uik.Modal title="Connecting to Mobile App"
        isOpen={wcPreloader.value}>
          <div>
          <div className='wc-preloader'>
            <div className='wc-loader'></div>
            <img src="/img/wallets/walletconnect.svg" alt="" className='wc-icon-preloader' />
          </div>
          <div className='wc-loader-label' >
            <Uik.Text type="mini" text={wcPreloader.message}/>
            </div>
          </div>
        </Uik.Modal>
  )
}

export default WcPreloader