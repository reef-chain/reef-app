import React, { useContext, useEffect, useState } from 'react';
import Uik from '@reef-chain/ui-kit';
import ReefSigners from '../../../context/ReefSigners';
import apiService from '../api/apiService';
import UserStatsCard from '../components/home/UserStatsCard';
import ReferralCodeCard from '../components/home/ReferralCodeCard';
import '../points.css';

interface LeaderboardEntry {
  userAddress: string;
  actionPoints: number;
  referralPoints: number;
  totalPoints: number;
  rank?: number | string;
  isSeparator?: boolean;
}

interface RawLeaderboardEntry {
  userAddress?: string;
  actionPoints?: number | string;
  referralPoints?: number | string;
  totalPoints?: number | string;
  totalActionPoints?: number | string;
  totalReferralPoints?: number | string;
  total?: number | string;
  rank?: number | string;
}

interface LeaderboardResponse {
  data?: RawLeaderboardEntry[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  total?: number;
}

interface UserStats {
  rank?: number;
  weeklyChange?: number;
  actionPoints?: number;
  referralPoints?: number;
  totalPoints?: number;
}

interface ReferralInfo {
  referralCode?: string;
  totalReferees?: number;
  referralPoints?: number;
}

const PAGE_SIZE = 20;

function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatPoints(value: number): string {
  return (value ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return fallback;
}

function normalizeLeaderboardEntry(entry: RawLeaderboardEntry): LeaderboardEntry {
  const actionPoints = toNumber(entry.actionPoints ?? entry.totalActionPoints);
  const referralPoints = toNumber(entry.referralPoints ?? entry.totalReferralPoints);
  const totalPoints = toNumber(entry.totalPoints ?? entry.total ?? actionPoints + referralPoints);

  return {
    userAddress: entry.userAddress || '',
    actionPoints,
    referralPoints,
    totalPoints,
    rank: entry.rank,
  };
}

function normalizeLeaderboardEntries(entries: unknown): LeaderboardEntry[] {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry) => normalizeLeaderboardEntry((entry || {}) as RawLeaderboardEntry))
    .filter((entry) => !!entry.userAddress);
}

function HomePage() {
  const { selectedSigner } = useContext(ReefSigners);
  const currentAddress = selectedSigner?.evmAddress?.toLowerCase();

  // Global leaderboard state (shown when no wallet)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User-specific state (shown when wallet connected)
  const [userLeaderboard, setUserLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [userDataLoading, setUserDataLoading] = useState(false);
  const [userDataError, setUserDataError] = useState<string | null>(null);

  // Register wallet with backend on connect
  useEffect(() => {
    if (currentAddress) {
      apiService.connectWallet(currentAddress).catch(() => {});
    }
  }, [currentAddress]);

  // Fetch global leaderboard (always)
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response: LeaderboardResponse = await apiService.getLeaderboardPoints(page, PAGE_SIZE);
        const rows = normalizeLeaderboardEntries(Array.isArray(response) ? response : response?.data);
        setLeaderboard(rows);

        const resolvedTotal = toNumber(
          response?.pagination?.total ?? response?.total ?? rows.length
        );
        const resolvedTotalPages = toNumber(
          response?.pagination?.totalPages ?? Math.ceil(resolvedTotal / PAGE_SIZE)
        );

        setTotalPages(Math.max(1, resolvedTotalPages));
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to fetch leaderboard'));
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [page]);

  // Fetch user-specific data when wallet is connected
  useEffect(() => {
    if (!currentAddress) {
      setUserLeaderboard([]);
      setUserStats(null);
      setReferralInfo(null);
      return;
    }

    const fetchUserData = async () => {
      setUserDataLoading(true);
      setUserDataError(null);
      try {
        const [leaderboardRes, statsRes, referralRes] = await Promise.all([
          apiService.getUserLeaderboardPoints(currentAddress),
          apiService.getUserWeeklyStats(currentAddress),
          apiService.getReferralInfo(currentAddress),
        ]);
        const leaderboardPayload = (leaderboardRes || {}) as {
          top5?: RawLeaderboardEntry[];
          aroundUser?: RawLeaderboardEntry[];
          data?: RawLeaderboardEntry[];
        };

        // Handle both response shapes:
        // 1) { top5, aroundUser, currentUserRank, ... }
        // 2) { data: [...] } / [...]
        let entries: LeaderboardEntry[] = [];
        if (Array.isArray(leaderboardPayload.top5) || Array.isArray(leaderboardPayload.aroundUser)) {
          const topEntries = normalizeLeaderboardEntries(leaderboardPayload.top5 || []);
          const aroundRaw: RawLeaderboardEntry[] = Array.isArray(leaderboardPayload.aroundUser) ? leaderboardPayload.aroundUser : [];
          const userIndex = aroundRaw.findIndex((item) => (
            String(item?.rank).toLowerCase() === 'you'
              || String(item?.userAddress || '').toLowerCase() === currentAddress
          ));
          const aroundSlice = userIndex >= 0
            ? aroundRaw.slice(Math.max(0, userIndex - 2), Math.min(aroundRaw.length, userIndex + 3))
            : aroundRaw;
          const surroundingEntries = normalizeLeaderboardEntries(aroundSlice);
          entries = [...topEntries];
          if (topEntries.length > 0 && surroundingEntries.length > 0) {
            entries.push({
              userAddress: 'separator',
              actionPoints: 0,
              referralPoints: 0,
              totalPoints: 0,
              isSeparator: true,
            });
          }
          entries.push(...surroundingEntries);
        } else {
          const flatEntries = normalizeLeaderboardEntries(
            Array.isArray(leaderboardRes) ? leaderboardRes : leaderboardPayload.data
          );
          const topEntries = flatEntries.slice(0, 5);
          const surroundingEntries = flatEntries.slice(5);
          entries = [...topEntries];
          if (surroundingEntries.length > 0) {
            entries.push({
              userAddress: 'separator',
              actionPoints: 0,
              referralPoints: 0,
              totalPoints: 0,
              isSeparator: true,
            });
            entries.push(...surroundingEntries);
          }
        }

        setUserLeaderboard(entries);

        const rawStats = statsRes?.data || statsRes || {};
        setUserStats({
          rank: toNumber(rawStats.rank),
          weeklyChange: toNumber(rawStats.weeklyChange),
          actionPoints: toNumber(rawStats.actionPoints ?? rawStats.totalActionPoints),
          referralPoints: toNumber(rawStats.referralPoints ?? rawStats.totalReferralPoints),
          totalPoints: toNumber(rawStats.totalPoints ?? rawStats.total),
        });

        const rawReferral = referralRes?.data || referralRes || {};
        setReferralInfo({
          referralCode: rawReferral.referralCode || '',
          totalReferees: toNumber(rawReferral.totalReferees ?? rawReferral.totalValueOfReferees),
          referralPoints: toNumber(rawReferral.referralPoints ?? rawReferral.totalReferralPoints),
        });
      } catch (err: unknown) {
        setUserDataError(getErrorMessage(err, 'Failed to fetch user data'));
      } finally {
        setUserDataLoading(false);
      }
    };

    fetchUserData();
  }, [currentAddress]);

  const renderLeaderboardTable = (entries: LeaderboardEntry[], withPagination = false) => (
    <Uik.Table
      seamless
      pagination={withPagination ? { current: page, count: totalPages, onChange: setPage } : undefined}
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
        {entries.map((entry, index) => {
          if (entry.isSeparator) {
            return (
              <Uik.Tr key="separator">
                <Uik.Td align="center">···</Uik.Td>
                <Uik.Td /><Uik.Td /><Uik.Td /><Uik.Td />
              </Uik.Tr>
            );
          }
          const rank = entry.rank ?? (withPagination ? (page - 1) * PAGE_SIZE + index + 1 : index + 1);
          const isCurrentUser = !!currentAddress && entry.userAddress?.toLowerCase() === currentAddress;
          return (
            <Uik.Tr key={`${entry.userAddress}-${entry.rank ?? index}`} className={isCurrentUser ? 'points__you-row' : ''}>
              <Uik.Td align="center">{isCurrentUser ? 'You' : rank}</Uik.Td>
              <Uik.Td>{truncateAddress(entry.userAddress)}</Uik.Td>
              <Uik.Td align="right">{formatPoints(entry.actionPoints)}</Uik.Td>
              <Uik.Td align="right">{formatPoints(entry.referralPoints)}</Uik.Td>
              <Uik.Td align="right">{formatPoints(entry.totalPoints)}</Uik.Td>
            </Uik.Tr>
          );
        })}
      </Uik.TBody>
    </Uik.Table>
  );

  return (
    <div className="points" style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <Uik.Text type="title" text="Points Leaderboard" />

      {error && <Uik.Alert type="danger" text={error} />}

      {/* User stats cards when wallet is connected */}
      {currentAddress && (
        <>
          {userDataLoading ? (
            <Uik.Loading />
          ) : userDataError ? (
            <Uik.Alert type="danger" text={userDataError} />
          ) : (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {userStats && (
                <div style={{ flex: '1 1 300px' }}>
                  <UserStatsCard
                    rank={userStats.rank ?? 0}
                    weeklyChange={userStats.weeklyChange ?? 0}
                    actionPoints={userStats.actionPoints ?? 0}
                    referralPoints={userStats.referralPoints ?? 0}
                  />
                </div>
              )}
              {referralInfo && (
                <div style={{ flex: '1 1 300px' }}>
                  <ReferralCodeCard
                    referralCode={referralInfo.referralCode ?? ''}
                    totalReferees={referralInfo.totalReferees ?? 0}
                    referralPoints={referralInfo.referralPoints ?? 0}
                  />
                </div>
              )}
            </div>
          )}

          {/* User-specific leaderboard */}
          {userLeaderboard.length > 0 && !userDataLoading && (
            <>
              <Uik.Text type="lead" text="Your Position" />
              {renderLeaderboardTable(userLeaderboard, false)}
              <Uik.Divider spacing="small" />
            </>
          )}
        </>
      )}

      {/* Global leaderboard */}
      <Uik.Text type="lead" text="Global Leaderboard" />
      {loading ? (
        <Uik.Loading />
      ) : (
        renderLeaderboardTable(leaderboard, true)
      )}
    </div>
  );
}

export default HomePage;
