// Utility to format seconds as h:mm:ss or m:ss
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "-";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}h:${m.toString().padStart(2, "0")}m:${s.toString().padStart(2, "0")}s`;
  } else {
    return `${m}m:${s.toString().padStart(2, "0")}s`;
  }
}
