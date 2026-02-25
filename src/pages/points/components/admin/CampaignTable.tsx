import React from 'react';
import Uik from '@reef-chain/ui-kit';

export interface Campaign {
  poolAddress: string;
  bootstrappingEligible?: boolean;
  earlySznEligible?: boolean;
  memeSznEligible?: boolean;
  bootstrappingStartDate?: string;
  bootstrappingEndDate?: string;
  earlySznStartDate?: string;
  earlySznEndDate?: string;
  memeSznStartDate?: string;
  memeSznEndDate?: string;
}

interface CampaignTableProps {
  campaigns: Campaign[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
}

function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(date?: string): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function CampaignTable({
  campaigns,
  total,
  page,
  pageSize,
  loading,
  onPageChange,
  onEdit,
  onDelete,
}: CampaignTableProps) {
  if (loading) return <Uik.Loading />;

  return (
    <Uik.Table
      seamless
      pagination={{ current: page, count: Math.ceil(total / pageSize), onChange: onPageChange }}
    >
      <Uik.THead>
        <Uik.Tr>
          <Uik.Th>Pool Address</Uik.Th>
          <Uik.Th>Eligibility</Uik.Th>
          <Uik.Th>Bootstrapping Dates</Uik.Th>
          <Uik.Th>Early Szn Dates</Uik.Th>
          <Uik.Th>Meme Szn Dates</Uik.Th>
          <Uik.Th align="right">Actions</Uik.Th>
        </Uik.Tr>
      </Uik.THead>
      <Uik.TBody>
        {campaigns.length === 0 ? (
          <Uik.Tr>
            <Uik.Td align="center">No campaigns found</Uik.Td>
          </Uik.Tr>
        ) : (
          campaigns.map((campaign) => (
            <Uik.Tr key={campaign.poolAddress}>
              <Uik.Td>
                <Uik.Tooltip text={campaign.poolAddress}>
                  <span>{truncateAddress(campaign.poolAddress)}</span>
                </Uik.Tooltip>
              </Uik.Td>
              <Uik.Td>
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                  {campaign.bootstrappingEligible && <Uik.Tag text="Bootstrapping" color="blue" />}
                  {campaign.earlySznEligible && <Uik.Tag text="EarlySzn" color="green" />}
                  {campaign.memeSznEligible && <Uik.Tag text="MemeSzn" color="red" />}
                  {!campaign.bootstrappingEligible && !campaign.earlySznEligible && !campaign.memeSznEligible && (
                    <Uik.Tag text="None" />
                  )}
                </div>
              </Uik.Td>
              <Uik.Td>
                {campaign.bootstrappingEligible
                  ? `${formatDate(campaign.bootstrappingStartDate)} – ${formatDate(campaign.bootstrappingEndDate)}`
                  : '—'}
              </Uik.Td>
              <Uik.Td>
                {campaign.earlySznEligible
                  ? `${formatDate(campaign.earlySznStartDate)} – ${formatDate(campaign.earlySznEndDate)}`
                  : '—'}
              </Uik.Td>
              <Uik.Td>
                {campaign.memeSznEligible
                  ? `${formatDate(campaign.memeSznStartDate)} – ${formatDate(campaign.memeSznEndDate)}`
                  : '—'}
              </Uik.Td>
              <Uik.Td align="right">
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <Uik.Button size="small" text="Edit" onClick={() => onEdit(campaign)} />
                  <Uik.Button size="small" danger text="Delete" onClick={() => onDelete(campaign)} />
                </div>
              </Uik.Td>
            </Uik.Tr>
          ))
        )}
      </Uik.TBody>
    </Uik.Table>
  );
}

export default CampaignTable;
