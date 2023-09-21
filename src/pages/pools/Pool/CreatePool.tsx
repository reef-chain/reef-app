import {
  appState,
  Components,
  graphql,
  hooks,
  store,
  Token,
} from '@reef-defi/react-lib';
import {  gql,useSubscription} from '@apollo/client';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import TokenContext from '../../../context/TokenContext';
import TokenPricesContext from '../../../context/TokenPricesContext';
import { notify } from '../../../utils/utils';
import '../../../common/overlay-swap.css';
import './create-pool.css';
import { localizedStrings } from '../../../l10n/l10n';
import { useHistory } from 'react-router-dom';
import PoolContext from '../../../context/PoolContext';

const { Provide, OverlayAction, Finalizing } = Components;

export interface Props {
  isOpen: boolean;
  onClose?: () => void;
}

interface TokenPair {
  address1?:string;
  address2?:string;
}

const CreatePool = ({
  isOpen,
  onClose,
}: Props): JSX.Element => {
  const [address1, setAddress1] = useState('0x');
  const [address2, setAddress2] = useState('0x');
  const [tokenPair,setTokenPair] = useState<TokenPair|undefined>(undefined);

  const [finalized, setFinalized] = useState(true);

  const { tokens } = useContext(TokenContext);
  const tokenPrices = useContext(TokenPricesContext);

  const history = useHistory();

  const signer = hooks.useObservableState(
    appState.selectedSigner$,
  );
  const network = hooks.useObservableState(
    appState.currentNetwork$,
  );

  const apolloDex = hooks.useObservableState(
    graphql.apolloDexClientInstance$,
  );

  const FETCH_POOL_ADDRESS = gql`
  query PoolAddress($token1: String!, $token2: String!) {
    pools(where: {token1: {id_eq: $token1}, token2: {id_eq: $token2}},limit: 10) {
      id
    }
  }  
`;

const pools = useContext(PoolContext);

  useEffect(()=>{
      if(!finalized && !tokenPair){
        setTokenPair({address1,address2});
      }
      if(tokenPair){
        const fetchPoolAddress = ()=>{apolloDex.query({
          query:FETCH_POOL_ADDRESS,
          fetchPolicy:'no-cache',
          
          variables:{
            token1:tokenPair.address1,
            token2:tokenPair.address2,
          }
        }).then(res=>res.data.length>0?history.push(`/chart/${res.data.pools[0].id}/trade`):
        pools.forEach((pool)=>{
          console.log("checking")
          if(pool.token1==tokenPair.address1&&pool.token2==tokenPair.address2){
            history.push(`/chart/${pool.address}/trade`)
          }
        })
        )}
        fetchPoolAddress();
      }
      
  },[finalized,pools])

  
  const [provideState, provideDispatch] = useReducer(
    store.addLiquidityReducer,
    store.initialAddLiquidityState,
  );

  hooks.useAddLiquidity({
    address1,
    address2,
    dispatch: provideDispatch,
    state: provideState,
    tokens,
    signer: signer || undefined,
    dexClient: apolloDex,
    tokenPrices,
  });

  const onAddLiquidity = hooks.onAddLiquidity({
    state: provideState,
    network,
    signer: signer || undefined,
    batchTxs: network?.name === 'mainnet',
    dispatch: provideDispatch,
    notify,
    updateTokenState: async () => {}, // eslint-disable-line
    onSuccess: () => {
      setFinalized(false)
    },
    onFinalized: async() => {
      setFinalized(true);
      if (onClose) onClose();
    },
  });

  const onClosed = (): void => {
    setAddress1('0x');
    setAddress2('0x');
  };

  const onOpened = (): void => {
    const [, overlay] = document.querySelectorAll('.uik-dropdown__overlay');
    // @ts-ignore-next-line
    if (overlay) overlay.click();
  };

  return (
    <OverlayAction
      isOpen={isOpen}
      title={localizedStrings.create_pool}
      onClose={onClose}
      onClosed={onClosed}
      onOpened={onOpened}
      className="overlay-swap create-pool"
    >
      <div className="uik-pool-actions pool-actions">
        {
          finalized
            ? (
              <Provide
                state={provideState}
                tokens={tokens}
                actions={{
                  onAddLiquidity,
                  selectToken1: (token: Token): void => setAddress1(token.address),
                  selectToken2: (token: Token): void => setAddress2(token.address),
                  setPercentage: (amount: number) => provideDispatch(store.setPercentageAction(amount)),
                  setToken1Amount: (amount: string) => provideDispatch(store.setToken1AmountAction(amount)),
                  setToken2Amount: (amount: string) => provideDispatch(store.setToken2AmountAction(amount)),
                }}
                confirmText={localizedStrings.create_pool}
              />
            )
            : <Finalizing/>
            
        }
      </div>
    </OverlayAction>
  );
};

export default CreatePool;
