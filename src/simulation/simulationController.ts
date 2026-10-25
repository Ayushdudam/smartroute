export type SimulationSpeed = 0.5 | 1 | 2 | 4 | 'instant';

export const SPEED_INTERVALS: Record<Exclude<SimulationSpeed, 'instant'>, number> = {
  0.5: 1200,
  1: 600,
  2: 300,
  4: 150,
};

export const DEFAULT_SPEED: SimulationSpeed = 1;

const SPEED_STORAGE_KEY = 'smartroute_simulation_speed';

export function loadStoredSpeed(): SimulationSpeed {
  try {
    const raw = localStorage.getItem(SPEED_STORAGE_KEY);
    if (!raw) return DEFAULT_SPEED;
    if (raw === 'instant') return 'instant';
    const num = parseFloat(raw);
    if (num === 0.5 || num === 1 || num === 2 || num === 4) {
      return num as SimulationSpeed;
    }
  } catch {
    // Graceful fallback if localStorage is disabled or inaccessible
  }
  return DEFAULT_SPEED;
}

export function saveStoredSpeed(speed: SimulationSpeed): void {
  try {
    localStorage.setItem(SPEED_STORAGE_KEY, String(speed));
  } catch {
    // Ignore storage failure
  }
}

export function calculateNextStep(current: number, totalSteps: number): number {
  if (totalSteps <= 0) return 0;
  return Math.min(current + 1, totalSteps - 1);
}

export function calculatePreviousStep(current: number): number {
  return Math.max(current - 1, 0);
}

export function isSimulationAtEnd(current: number, totalSteps: number): boolean {
  return totalSteps > 0 && current >= totalSteps - 1;
}

export function isSimulationAtStart(current: number): boolean {
  return current <= 0;
}
