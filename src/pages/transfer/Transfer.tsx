import { Components } from '@reef-chain/react-lib'
import React, { useContext } from 'react'
import TokenContext from '../../context/TokenContext';
import ReefSigners from '../../context/ReefSigners';
import { notify } from '../../utils/utils';
import Uik from "@reef-chain/ui-kit";

function Transfer() {
  const {OverlaySend} = Components;

  const { tokens } = useContext(TokenContext);
  const { selectedSigner, provider, accounts } = useContext(ReefSigners);
  const token = tokens?tokens[0]:undefined
  
  if(!token){
    return <Uik.Loading />
  }

  return (
    <OverlaySend
        tokenAddress={token.address}
        isOpen={true}
        tokens={tokens}
        selectedSigner={selectedSigner}
        provider={provider}
        accounts={accounts}
        notify={notify}
      />
  )
}

export default Transfer