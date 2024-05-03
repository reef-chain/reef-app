import { Token,Components } from '@reef-chain/react-lib';
import Uik from '@reef-chain/ui-kit';
import React, { useContext } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import BigNumber from 'bignumber.js';
import TokenPricesContext from '../../context/TokenPricesContext';
// import TokenCard from './TokenCard';
import { BUY_URL, CREATE_ERC20_TOKEN_URL } from '../../urls';
import { localizedStrings } from '../../l10n/l10n';
import './loading-animation.css';
import ReefSigners from '../../context/ReefSigners';
import { isReefswapUI, useDexConfig } from '../../environment';
import HideBalance from '../../context/HideBalance';
import PoolContext from '../../context/PoolContext';

interface TokenBalances {
    tokens: Token[];
}

const {Skeleton,TokenCard} = Components;

const CreateTokenButton = (): JSX.Element => (
  <Link
    to={CREATE_ERC20_TOKEN_URL}
    type="button"
    className="dashboard__tokens-create-btn"
  >
    <Uik.Icon icon={faPlus} />
    <span>{localizedStrings.create_token_db}</span>
  </Link>
);

const balanceValue = (token: Token, price = 0): number => (new BigNumber(token.balance.toString())
  .div(new BigNumber(10).pow(token.decimals))
  .multipliedBy(price)
  .toNumber());

export const TokenBalances = ({ tokens }: TokenBalances): JSX.Element => {
  const tokenPrices = useContext(TokenPricesContext);
  const { selectedSigner, network,provider ,accounts } = useContext(ReefSigners);
  const hideBalance = useContext(HideBalance);
  const pools = useContext(PoolContext);
  const { selectedSigner: signer, network: nw } = useContext(ReefSigners);

  const isReefBalanceZero = selectedSigner?.balance._hex === '0x00';

  const getUrl = (): string => {
    if (network.name === 'mainnet') return BUY_URL;
    if (isReefswapUI) return 'https://discord.com/channels/1116016091014123521/1120371707019010128';
    return 'https://discord.com/channels/793946260171259904/1087737503550816396';
  };

  const tokenCards = tokens
    .filter(({ balance }) => {
      try {
        return balance.gt(0);
      } catch (error) {
      }
      return false;
    })
    .sort((a, b) => {
      const balanceA = balanceValue(a, tokenPrices[a.address] || 0);
      const balanceB = balanceValue(b, tokenPrices[b.address] || 0);

      if (balanceA > balanceB) return -1;
      return 1;
    })
    .sort((a) => {
      if (a.symbol !== 'REEF') return 1;
      return -1;
    })
    .map((token) => (
      <TokenCard 
      accounts={accounts}
      hideBalance={hideBalance}
      pools={pools}
      tokenPrices={tokenPrices}
      signer={signer}
      nw={nw}
      selectedSigner={selectedSigner}
      provider={provider}
      useDexConfig={useDexConfig}
      isReefswapUI={isReefswapUI}
      price={tokenPrices[token.address] || 0}
      token={token}
      tokens={tokens}
      />
    ));

  return (
    <div className="dashboard__tokens">
      {
        /* eslint-disable no-nested-ternary */
                tokens.length === 0 && !isReefBalanceZero
                  ? (
                    <>
                      <Skeleton />
                      <Skeleton />
                      <Skeleton />
                      <Skeleton />
                    </>
                  )
                  : (
                    isReefBalanceZero
                      ? (
                        <div className="card-bg-light card token-card--no-balance">
                          <div className="no-token-activity">
                            No tokens found. &nbsp;
                            {network.name === 'mainnet'
                              ? <Link className="text-btn" to={getUrl()}>Get $REEF coins here.</Link>
                              : (
                                <a className="text-btn" href={getUrl()} target="_blank" rel="noopener noreferrer">
                                  Get Reef testnet tokens here.
                                </a>
                              )}
                          </div>
                        </div>
                      )

                      : (
                        <>
                          {tokenCards}
                          {tokens.length > 1 && <CreateTokenButton />}
                        </>
                      )
                  )
            }
    </div>
  );
};