/**
 * Generate a deterministic fake reader count that only goes up over time.
 * Newer items start with very few views; older ones accumulate naturally.
 */

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getFakeReaderCount(id: string, publishedAt: string): number {
  const hash = simpleHash(id);
  const pubDate = new Date(publishedAt);
  const now = new Date();
  const daysSince = Math.max(0, Math.floor((now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24)));
  const currentHour = now.getHours();

  // First few hours: just 1-5 views (brand new)
  if (daysSince === 0) {
    return 1 + (hash % 3) + Math.floor(currentHour / 6);
  }

  // Day 1: 8-20 views
  if (daysSince === 1) {
    return 8 + (hash % 12) + Math.floor(currentHour / 4);
  }

  // Days 2-7 (first week): accelerating interest, 25-120 views
  if (daysSince <= 7) {
    const weekBase = 20 + (hash % 15);
    const dailyGrowth = 10 + (hash % 8);
    return weekBase + (daysSince * dailyGrowth) + Math.floor(currentHour / 6);
  }

  // After first week: steady growth
  // Base from first week
  const weekEnd = 20 + (hash % 15) + (7 * (10 + (hash % 8)));
  
  // Slower steady rate: 5-18 readers/day after the initial spike
  const steadyRate = 5 + (hash % 14);
  const daysAfterWeek = daysSince - 7;
  
  // Slight organic variation per day
  const dayVariation = simpleHash(id + daysSince.toString()) % 4;
  
  // Hourly bonus within current day
  const hourlyBonus = Math.floor((steadyRate / 24) * currentHour);

  return weekEnd + (daysAfterWeek * steadyRate) + hourlyBonus + dayVariation;
}

export function formatReaderCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return count.toLocaleString("es-MX");
}
