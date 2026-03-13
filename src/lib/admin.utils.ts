const SECONDS_IN = {
  minute: 60,
  hour: 3600,
  day: 86400,
  week: 604800,
  month: 2592000,
  year: 31536000,
} as const;

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "just now";
  if (diffSec < SECONDS_IN.hour) {
    const mins = Math.floor(diffSec / SECONDS_IN.minute);
    return `${mins} ${mins === 1 ? "minute" : "minutes"} ago`;
  }
  if (diffSec < SECONDS_IN.day) {
    const hours = Math.floor(diffSec / SECONDS_IN.hour);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
  if (diffSec < SECONDS_IN.month) {
    const days = Math.floor(diffSec / SECONDS_IN.day);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }
  if (diffSec < SECONDS_IN.year) {
    const months = Math.floor(diffSec / SECONDS_IN.month);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  }
  const years = Math.floor(diffSec / SECONDS_IN.year);
  return `${years} ${years === 1 ? "year" : "years"} ago`;
}

export const BAN_DURATIONS = [
  { label: "1 hour", seconds: 3600 },
  { label: "1 day", seconds: 86400 },
  { label: "7 days", seconds: 604800 },
  { label: "30 days", seconds: 2592000 },
  { label: "Permanent", seconds: undefined },
] as const;
