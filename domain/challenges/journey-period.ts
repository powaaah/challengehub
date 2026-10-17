// Calendar days include the starting day. Keep the completed 100-day window stable.
export function getJourneyPeriod(slug: string, startedAt: string, today: string) {
  if (slug !== '100-tage-body-transformation') return { today, ended: false, endDate: null };
  const start = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(startedAt));
  const end = new Date(`${start}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 99);
  const endDate = end.toISOString().slice(0, 10);
  return { today: today > endDate ? endDate : today, ended: today > endDate, endDate };
}
