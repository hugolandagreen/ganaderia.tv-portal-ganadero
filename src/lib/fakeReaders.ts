/**
 * Generate a deterministic fake reader count that only goes up over time.
 * Uses a hash of the ID to create a unique base + daily increment per item.
 * The count increases every day and never decreases.
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
  
  // Base readers: 120–480 (seeded by ID)
  const base = 120 + (hash % 360);
  
  // Days since publication
  const pubDate = new Date(publishedAt);
  const now = new Date();
  const daysSince = Math.max(0, Math.floor((now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Daily increment: 8–35 readers/day (seeded by ID so each item has its own rate)
  const dailyRate = 8 + (hash % 28);
  
  // Add some "hourly" variation within the current day (only goes up within the day)
  const currentHour = now.getHours();
  const hourlyBonus = Math.floor((dailyRate / 24) * currentHour);
  
  // Small per-item variation per day to make it look more organic
  const dayVariation = (simpleHash(id + daysSince.toString()) % 5);
  
  return base + (daysSince * dailyRate) + hourlyBonus + dayVariation;
}

export function formatReaderCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return count.toLocaleString("es-MX");
}
