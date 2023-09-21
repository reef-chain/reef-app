import {
  appState,
  Components,
  graphql,
  hooks,
  store,
  Token,
} from '@reef-defi/react-lib';
import {  gql } from '@apollo/client';
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
  query userPoolSupply($token1: String!, $token2: String!) {
    userPoolSupply(token1: $token1, token2: $token2, signerAddress: "") {
      address
    }
  }
`;

const pools = useContext(PoolContext);

  useEffect(()=>{
    const fetchPoolAddress = async()=>{
      if(!finalized && !tokenPair){
        setTokenPair({address1,address2});
      }
      else{
          if(tokenPair){
            const interval = setInterval(async () => {
              let poolAddressResp = await apolloDex.query({
                query: FETCH_POOL_ADDRESS,
                fetchPolicy:'network-only',
                variables: {
                  token1: tokenPair.address1,
                  token2: tokenPair.address2,
                },
              });
          
              console.log(poolAddressResp.data.userPoolSupply.address);
          
              if (poolAddressResp.data.userPoolSupply.address !== "0x0000000000000000000000000000000000000000") {
                clearInterval(interval);
                history.push(`/chart/${poolAddressResp.data.userPoolSupply.address}/trade`);
              }
            }, 10000);
          }
      }
    }
    fetchPoolAddress();
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
