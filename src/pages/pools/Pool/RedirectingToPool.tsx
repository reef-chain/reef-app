import Uik from '@reef-chain/ui-kit';
import React from 'react';
import './redirecting.css';

function RedirectingToPool():JSX.Element {
  return (
    <div className="pool-actions-redirecting">
      <div className="pool-actions-redirecting__animation">
        <Uik.FishAnimation />
        <Uik.FishAnimation />
      </div>
      <Uik.Text text="Registering new pool balances." />
      <Uik.Text type="mini" text="Redirecting to pool details shortly ..." />
    </div>
  );
}

export default RedirectingToPool;
