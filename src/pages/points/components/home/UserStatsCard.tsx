import React from 'react';
import Uik from '@reef-chain/ui-kit';

interface UserStatsCardProps {
  rank: number;
  weeklyChange: number;
  actionPoints: number;
  referralPoints: number;
}

function formatPoints(value: number): string {
  return (value ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function UserStatsCard({ rank, weeklyChange, actionPoints, referralPoints }: UserStatsCardProps) {
  return (
    <Uik.Card title="Your Stats">
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 120px' }}>
          <Uik.Text type="mini" text="Rank" />
          <Uik.Text type="lead" text={`#${rank}`} />
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <Uik.Text type="mini" text="Weekly Change" />
          <Uik.Trend
            type={weeklyChange >= 0 ? 'good' : 'bad'}
            direction={weeklyChange >= 0 ? 'up' : 'down'}
            text={`${weeklyChange >= 0 ? '+' : ''}${weeklyChange}`}
          />
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <Uik.Text type="mini" text="Action Points" />
          <Uik.Text type="lead" text={formatPoints(actionPoints)} />
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <Uik.Text type="mini" text="Referral Points" />
          <Uik.Text type="lead" text={formatPoints(referralPoints)} />
        </div>
      </div>
    </Uik.Card>
  );
}

export default UserStatsCard;
