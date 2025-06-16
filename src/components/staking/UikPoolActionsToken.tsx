import React from 'react';

interface Props {
  symbol: string;
  max: number;
}

const UikPoolActionsToken = ({ symbol, max }: Props): JSX.Element => (
  <div className="uik-pool-actions-token">
    <div className="uik-pool-actions-token__token">
      <div className="uik-pool-actions-token__info">
        <div className="uik-pool-actions-token__symbol">{symbol}</div>
        <div className="uik-pool-actions-token__amount">Available {max}</div>
      </div>
    </div>
  </div>
);

export default UikPoolActionsToken;
