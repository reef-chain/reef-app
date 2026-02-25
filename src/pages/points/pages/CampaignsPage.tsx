import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Uik from '@reef-chain/ui-kit';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../api/apiService';
import CampaignTable, { Campaign } from '../components/admin/CampaignTable';
import CreateCampaignModal from '../components/admin/CreateCampaignModal';
import DeleteCampaignModal from '../components/admin/DeleteCampaignModal';

const PAGE_SIZE = 20;

const NAV_TABS = [
  { value: 'dashboard', text: 'Dashboard' },
  { value: 'campaigns', text: 'Campaigns' },
];

function CampaignsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getCampaigns(page, PAGE_SIZE);
      setCampaigns(res?.data || res || []);
      setTotal(res?.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCampaigns(); }, [page]);

  const handleLogout = () => {
    logout();
    navigate('/points/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Uik.Text type="title" text="Points Admin" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user && (
            <Uik.Text type="light" text={user.username || user.email || 'Admin'} />
          )}
          <Uik.Button text="Logout" onClick={handleLogout} />
        </div>
      </div>

      {/* Navigation tabs */}
      <Uik.Tabs
        value="campaigns"
        options={NAV_TABS}
        onChange={(val) => {
          if (val === 'dashboard') navigate('/points/dashboard');
        }}
      />

      <div style={{ marginTop: '1.5rem' }}>
        <Uik.Card
          title="All Campaigns"
          head={
            <Uik.Button fill text="+ Create Campaign" onClick={() => { setEditingCampaign(null); setCreateModalOpen(true); }} />
          }
        >
          {error && <Uik.Alert type="danger" text={error} />}
          <CampaignTable
            campaigns={campaigns}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            loading={loading}
            onPageChange={setPage}
            onEdit={(c) => { setEditingCampaign(c); setCreateModalOpen(true); }}
            onDelete={(c) => setDeletingCampaign(c)}
          />
        </Uik.Card>
      </div>

      <CreateCampaignModal
        isOpen={createModalOpen}
        editingCampaign={editingCampaign}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchCampaigns}
      />
      <DeleteCampaignModal
        isOpen={!!deletingCampaign}
        campaign={deletingCampaign}
        onClose={() => setDeletingCampaign(null)}
        onSuccess={fetchCampaigns}
      />
    </div>
  );
}

export default CampaignsPage;
