export function calculateStakingAPY(
  personalStake: number,
  validatorTotalBonded: number,
  commissionRate: number,
  averagePoints: number,
  totalPointsTarget: number,
  inflationRate: number,
  totalSupply: number,
  daysPerYear = 365,
): number {
  const totalRewardsDaily = (inflationRate * totalSupply) / daysPerYear;
  const poolAllocation = (averagePoints / totalPointsTarget) * totalRewardsDaily;
  const stakeRatio = personalStake / validatorTotalBonded;
  const personalRewardDailyBeforeCommission = stakeRatio * poolAllocation;
  const personalRewardDaily = personalRewardDailyBeforeCommission * (1 - commissionRate);
  const apy = (personalRewardDaily * daysPerYear) / personalStake;
  return apy;
}
export default calculateStakingAPY;
