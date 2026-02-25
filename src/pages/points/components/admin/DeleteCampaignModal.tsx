import React, { useState } from 'react';
import Uik from '@reef-chain/ui-kit';
import apiService from '../../api/apiService';
import { Campaign } from './CampaignTable';

interface DeleteCampaignModalProps {
  isOpen: boolean;
  campaign: Campaign | null;
  onClose: () => void;
  onSuccess: () => void;
}

function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function DeleteCampaignModal({ isOpen, campaign, onClose, onSuccess }: DeleteCampaignModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!campaign) return;
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteCampaign(campaign.poolAddress);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Uik.Modal
      title="Delete Campaign"
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Uik.Button text="Cancel" onClick={onClose} />
          <Uik.Button danger fill text="Delete" loading={loading} onClick={handleDelete} />
        </div>
      }
    >
      {error && <Uik.Alert type="danger" text={error} />}
      <Uik.Text
        type="light"
        text={`Are you sure you want to delete the campaign for pool ${truncateAddress(campaign?.poolAddress || '')}? This action cannot be undone.`}
      />
    </Uik.Modal>
  );
}

export default DeleteCampaignModal;
