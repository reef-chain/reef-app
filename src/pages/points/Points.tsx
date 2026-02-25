import { useEffect, useState } from 'react';
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

function Points() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response: LeaderboardResponse = await apiService.getLeaderboardPoints(1, 20);
        setLeaderboard(response.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div>
      <h2>Points Leaderboard</h2>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && (
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Address</th>
              <th>Total Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={entry.userAddress}>
                <td>{entry.rank ?? index + 1}</td>
                <td>{entry.userAddress}</td>
                <td>{entry.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Points;
