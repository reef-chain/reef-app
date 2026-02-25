import { useEffect, useState } from 'react';
import Uik from '@reef-chain/ui-kit';
import apiService from './api/apiService';

interface LeaderboardEntry {
  userAddress: string;
  totalPoints: number;
  rank?: number;
}

interface LeaderboardResponse {
  data: LeaderboardEntry[];
  total?: number;
}

const PAGE_SIZE = 20;

function Points() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <Uik.Text type="title">Points Leaderboard</Uik.Text>

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
              <Uik.Th>Address</Uik.Th>
              <Uik.Th align="right">Total Points</Uik.Th>
            </Uik.Tr>
          </Uik.THead>

          <Uik.TBody>
            {leaderboard.map((entry, index) => (
              <Uik.Tr key={entry.userAddress}>
                <Uik.Td align="center">
                  {entry.rank ?? (page - 1) * PAGE_SIZE + index + 1}
                </Uik.Td>
                <Uik.Td>{entry.userAddress}</Uik.Td>
                <Uik.Td align="right">{entry.totalPoints.toLocaleString()}</Uik.Td>
              </Uik.Tr>
            ))}
          </Uik.TBody>
        </Uik.Table>
      )}
    </div>
  );
}

export default Points;
