export function formatScore(score: number): string {
  return `${Math.max(0, Math.min(100, Math.round(score)))}/100`;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}
