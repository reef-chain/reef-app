import React, { useEffect, useState } from 'react';
import Uik from '@reef-chain/ui-kit';
import apiService from '../../api/apiService';
import { Campaign } from './CampaignTable';

interface CreateCampaignModalProps {
  isOpen: boolean;
  editingCampaign: Campaign | null;
  onClose: () => void;
  onSuccess: () => void;
}

const emptyForm = (): Campaign => ({
  poolAddress: '',
  bootstrappingEligible: false,
  earlySznEligible: false,
  memeSznEligible: false,
  bootstrappingStartDate: '',
  bootstrappingEndDate: '',
  earlySznStartDate: '',
  earlySznEndDate: '',
  memeSznStartDate: '',
  memeSznEndDate: '',
});

function CreateCampaignModal({ isOpen, editingCampaign, onClose, onSuccess }: CreateCampaignModalProps) {
  const [form, setForm] = useState<Campaign>(emptyForm());
  const [pools, setPools] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm(editingCampaign ? { ...editingCampaign } : emptyForm());
      setError(null);
      apiService.getPools().then((res: any) => {
        const list: string[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setPools(list);
      }).catch(() => setPools([]));
    }
  }, [isOpen, editingCampaign]);

  const setField = <K extends keyof Campaign>(key: K, value: Campaign[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.poolAddress) {
      setError('Pool address is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (editingCampaign) {
        await apiService.updateCampaign(form.poolAddress, form);
      } else {
        await apiService.createCampaign([form]);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save campaign');
    } finally {
      setLoading(false);
    }
  };

  const poolOptions = pools.map((p) => ({ value: p, label: p }));

  return (
    <Uik.Modal
      title={editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Uik.Button text="Cancel" onClick={onClose} />
          <Uik.Button fill text={editingCampaign ? 'Update' : 'Create'} loading={loading} onClick={handleSubmit} />
        </div>
      }
    >
      <Uik.Form>
        {error && <Uik.Alert type="danger" text={error} />}

        {editingCampaign ? (
          <Uik.Input label="Pool Address" value={form.poolAddress} readOnly />
        ) : (
          <Uik.Select
            label="Pool Address"
            value={form.poolAddress}
            options={poolOptions}
            placeholder="Select a pool"
          />
        )}

        <Uik.Divider text="Eligibility" />

        <Uik.Checkbox
          label="Bootstrapping Eligible"
          value={!!form.bootstrappingEligible}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('bootstrappingEligible', e.target.checked)}
        />
        {form.bootstrappingEligible && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Uik.Input
              label="Bootstrapping Start"
              type="date"
              value={form.bootstrappingStartDate || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('bootstrappingStartDate', e.target.value)}
            />
            <Uik.Input
              label="Bootstrapping End"
              type="date"
              value={form.bootstrappingEndDate || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('bootstrappingEndDate', e.target.value)}
            />
          </div>
        )}

        <Uik.Checkbox
          label="Early Season Eligible"
          value={!!form.earlySznEligible}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('earlySznEligible', e.target.checked)}
        />
        {form.earlySznEligible && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Uik.Input
              label="Early Szn Start"
              type="date"
              value={form.earlySznStartDate || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('earlySznStartDate', e.target.value)}
            />
            <Uik.Input
              label="Early Szn End"
              type="date"
              value={form.earlySznEndDate || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('earlySznEndDate', e.target.value)}
            />
          </div>
        )}

        <Uik.Checkbox
          label="Meme Season Eligible"
          value={!!form.memeSznEligible}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('memeSznEligible', e.target.checked)}
        />
        {form.memeSznEligible && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Uik.Input
              label="Meme Szn Start"
              type="date"
              value={form.memeSznStartDate || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('memeSznStartDate', e.target.value)}
            />
            <Uik.Input
              label="Meme Szn End"
              type="date"
              value={form.memeSznEndDate || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('memeSznEndDate', e.target.value)}
            />
          </div>
        )}
      </Uik.Form>
    </Uik.Modal>
  );
}

export default CreateCampaignModal;
