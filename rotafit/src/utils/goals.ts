export interface GoalProgress {
  currentKm: number;
  goalKm: number;
  percent: number;
  isCompleted: boolean;
}

export function calculateWeeklyGoalProgress(
  totalDistanceMeters: number,
  goalKm: number,
): GoalProgress {
  const currentKm = Math.max(0, totalDistanceMeters) / 1000;
  const safeGoal = goalKm > 0 ? goalKm : 1;
  const rawRatio = currentKm / safeGoal;
  const percent = Math.min(Math.round(rawRatio * 100), 100);

  return {
    currentKm,
    goalKm: safeGoal,
    percent,
    isCompleted: currentKm >= safeGoal,
  };
}
