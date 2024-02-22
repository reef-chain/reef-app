import {
  Components, hooks, store, Token,
} from '@reef-chain/react-lib';
import axios, { AxiosInstance } from 'axios';
import React, { useContext, useReducer, useState } from 'react';
import { network as libNet } from '@reef-chain/util-lib';
import TokenContext from '../../../context/TokenContext';
import TokenPricesContext from '../../../context/TokenPricesContext';
import { notify } from '../../../utils/utils';
import '../../../common/overlay-swap.css';
import './create-pool.css';
import { localizedStrings } from '../../../l10n/l10n';
import ReefSigners from '../../../context/ReefSigners';

import RedirectingToPool from './RedirectingToPool';
import { useDexConfig } from '../../../environment';

const { Provide, OverlayAction, Finalizing } = Components;

export interface Props {
  isOpen: boolean;
  onClose?: () => void;
}

const CreatePool = ({
  isOpen,
  onClose,
}: Props): JSX.Element => {
  const [address1, setAddress1] = useState('0x');
  const [address2, setAddress2] = useState('0x');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const httpClient: AxiosInstance = axios;

  const [finalized, setFinalized] = useState(true);

  const { tokens } = useContext(TokenContext);
  const tokenPrices = useContext(TokenPricesContext);

  const { selectedSigner: signer, network: nw } = useContext(ReefSigners);

  const network: libNet.DexProtocolv2|undefined = useDexConfig(nw);

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
    httpClient,
    tokenPrices,
  });

  const onAddLiquidity = hooks.onAddLiquidity({
    state: provideState,
    network,
    signer: signer || undefined,
    batchTxs: nw?.name === 'mainnet',
    dispatch: provideDispatch,
    notify,
    updateTokenState: async () => {}, // eslint-disable-line
    onSuccess: () => setFinalized(false),
    onFinalized: () => {
      setIsRedirecting(true);
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
          // eslint-disable-next-line
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
            : isRedirecting ? (
              <RedirectingToPool />
            ) : <Finalizing />
        }

      </div>
    </OverlayAction>
  );
};

export default CreatePool;
