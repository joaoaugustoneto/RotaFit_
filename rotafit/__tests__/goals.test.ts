import { calculateWeeklyGoalProgress } from '@/utils/goals';

describe('calculateWeeklyGoalProgress', () => {
  it('calcula o progresso inicial zerado', () => {
    const res = calculateWeeklyGoalProgress(0, 20);
    expect(res.currentKm).toBe(0);
    expect(res.percent).toBe(0);
    expect(res.isCompleted).toBe(false);
  });

  it('calcula porcentagem intermediária proporcional', () => {
    const res = calculateWeeklyGoalProgress(10000, 20); // 10 km de 20 km
    expect(res.currentKm).toBe(10);
    expect(res.percent).toBe(50);
    expect(res.isCompleted).toBe(false);
  });

  it('marca como completado quando atinge ou supera a meta', () => {
    const res = calculateWeeklyGoalProgress(20000, 20);
    expect(res.percent).toBe(100);
    expect(res.isCompleted).toBe(true);

    const over = calculateWeeklyGoalProgress(25000, 20);
    expect(over.currentKm).toBe(25);
    expect(over.percent).toBe(100); // capped at 100 for bar width
    expect(over.isCompleted).toBe(true);
  });

  it('evita divisão por zero se a meta for menor ou igual a zero', () => {
    const res = calculateWeeklyGoalProgress(5000, 0);
    expect(res.goalKm).toBe(1);
    expect(res.isCompleted).toBe(true);
  });
});
