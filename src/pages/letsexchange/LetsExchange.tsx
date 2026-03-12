import React, { useContext } from 'react';
import { ReefSigner } from '@reef-chain/react-lib';
import ReefSigners from '../../context/ReefSigners';
import { letsExchangeAffiliateId } from '../../environment';
import Hero from '../alchemy-pay/Hero';
import './index.css';

const LETS_EXCHANGE_WIDGET_URL = (() => {
  const params = new URLSearchParams();
  // Keep source currency open ("any"), but force destination to REEF.
  // LetsExchange has multiple query aliases across widget versions, so set all.
  params.set('to', 'REEF');
  params.set('coin_to', 'REEF');
  params.set('default_coin_to', 'REEF');
  params.set('cex_default_coin_to', 'REEF');
  if (letsExchangeAffiliateId) {
    params.set('affiliate_id', letsExchangeAffiliateId);
    params.set('ref_id', letsExchangeAffiliateId);
  }
  return `https://my.letsexchange.io/v2/widget?${params.toString()}`;
})();

function LetsExchange(): JSX.Element {
  const signer: ReefSigner | undefined | null = useContext(ReefSigners).selectedSigner;

  return (
    <div className="letsexchange-container">
      <div>
        <Hero
          title="Swap to Reef"
          subtitle="Swap any supported token to REEF with LetsExchange."
          isLoading={signer == undefined}
          imageAlt="Reef x LetsExchange banner"
        />

        <div className="letsexchange-widget-wrapper">
          <iframe
            src={LETS_EXCHANGE_WIDGET_URL}
            height="720px"
            width="100%"
            frameBorder="0"
            title="LetsExchange widget"
            className="letsexchange-widget"
          />
        </div>
      </div>
    </div>
  );
}

export default LetsExchange;
