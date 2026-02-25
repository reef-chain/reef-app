import { useContext, useEffect, useState } from 'react';
import Uik from '@reef-chain/ui-kit';
import ReefSigners from '../../context/ReefSigners';
import apiService from './api/apiService';
import './points.css';

interface LeaderboardEntry {
  userAddress: string;
  actionPoints: number;
  referralPoints: number;
  totalPoints: number;
  rank?: number;
}

interface LeaderboardResponse {
  data: LeaderboardEntry[];
  total?: number;
}

const PAGE_SIZE = 20;

function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatPoints(value: number): string {
  return (value ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function Points() {
  const { selectedSigner } = useContext(ReefSigners);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentAddress = selectedSigner?.evmAddress?.toLowerCase();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response: LeaderboardResponse = await apiService.getLeaderboardPoints(page, PAGE_SIZE);
        setLeaderboard(response.data || []);
        setTotal(response.total || 0);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [page]);

  return (
    <div className="points">
      <Uik.Text type="title" text="Leaderboard" />

      {error && (
        <Uik.Alert
          type="danger"
          text={error}
        />
      )}

      {loading ? (
        <Uik.Loading />
      ) : (
        <Uik.Table
          seamless
          pagination={{
            current: page,
            count: Math.ceil(total / PAGE_SIZE),
            onChange: setPage,
          }}
        >
          <Uik.THead>
            <Uik.Tr>
              <Uik.Th width="10">Rank</Uik.Th>
              <Uik.Th>User</Uik.Th>
              <Uik.Th align="right">Action Points</Uik.Th>
              <Uik.Th align="right">Referral Points</Uik.Th>
              <Uik.Th align="right">Total</Uik.Th>
            </Uik.Tr>
          </Uik.THead>

          <Uik.TBody>
            {leaderboard.map((entry, index) => {
              const rank = entry.rank ?? (page - 1) * PAGE_SIZE + index + 1;
              const isCurrentUser = !!currentAddress && entry.userAddress?.toLowerCase() === currentAddress;
              return (
                <Uik.Tr key={entry.userAddress} className={isCurrentUser ? 'points__you-row' : ''}>
                  <Uik.Td align="center">
                    {isCurrentUser ? 'You' : rank}
                  </Uik.Td>
                  <Uik.Td>{truncateAddress(entry.userAddress)}</Uik.Td>
                  <Uik.Td align="right">{formatPoints(entry.actionPoints)}</Uik.Td>
                  <Uik.Td align="right">{formatPoints(entry.referralPoints)}</Uik.Td>
                  <Uik.Td align="right">{formatPoints(entry.totalPoints)}</Uik.Td>
                </Uik.Tr>
              );
            })}
          </Uik.TBody>
        </Uik.Table>
      )}
    </div>
  );
}

export default Points;
