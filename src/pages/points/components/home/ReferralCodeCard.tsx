import React, { useContext } from 'react';
import Uik from '@reef-chain/ui-kit';
import { useFormo } from '@formo/analytics';
import ReefSigners from '../../../../context/ReefSigners';

interface ReferralCodeCardProps {
  referralCode: string;
  totalReferees: number;
  referralPoints: number;
}

function formatPoints(value: number): string {
  return (value ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ReferralCodeCard({ referralCode, totalReferees, referralPoints }: ReferralCodeCardProps) {
  const analyticsFormo = useFormo();
  const { network: nw } = useContext(ReefSigners);
  
  const handleCopyCode = async () => {
    if (!referralCode) return;
    
    try {
      await navigator.clipboard.writeText(referralCode);
      
      analyticsFormo.track('referral_code_copied', {
        referral_code: referralCode,
        network: nw?.name || 'mainnet',
      });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  return (
    <Uik.Card title="Your Referral">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Uik.Text type="mini" text="Referral Code" />
          <Uik.Text type="lead" text={referralCode || '—'} />
          {referralCode && (
            <Uik.Button 
              size="small" 
              text="Copy" 
              onClick={handleCopyCode}
            />
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 120px' }}>
            <Uik.Text type="mini" text="Total Referees" />
            <Uik.Text type="lead" text={String(totalReferees ?? 0)} />
          </div>
          <div style={{ flex: '1 1 120px' }}>
            <Uik.Text type="mini" text="Referral Points" />
            <Uik.Text type="lead" text={formatPoints(referralPoints)} />
          </div>
        </div>
      </div>
    </Uik.Card>
  );
}

export default ReferralCodeCard;
