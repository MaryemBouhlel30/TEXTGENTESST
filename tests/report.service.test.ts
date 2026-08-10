// [DEV: MBH] [DATE: 2026-08-05] [JIRA: JIRA-123]

import { groupByDay, totalForDay, Transaction } from '../src/services/report.service';

describe('groupByDay (Bug #2, timezone)', () => {
  const originalTZ = process.env.TZ;

  beforeAll(() => {
    // Fuseau fixe UTC+2 (sans DST) pour reproduire un serveur en avance sur UTC,
    // ex. Tunisie/Europe.
    process.env.TZ = 'Etc/GMT-2';
  });

  afterAll(() => {
    process.env.TZ = originalTZ;
  });

  it("classe une transaction de dimanche 23h30 UTC sous la clé du dimanche, pas du lundi", () => {
    const transactions: Transaction[] = [
      { timestampUTC: '2026-07-19T23:30:00Z', amount: 100 }, // dimanche 19/07, 01h30 lundi 20/07 en UTC+2
    ];

    const groups = groupByDay(transactions);

    expect(groups['19/07/2026']).toEqual(transactions);
    expect(groups['20/07/2026']).toBeUndefined();
  });

  it("n'attribue pas le total de la transaction de dimanche soir au lundi", () => {
    const transactions: Transaction[] = [
      { timestampUTC: '2026-07-19T23:30:00Z', amount: 100 },
      { timestampUTC: '2026-07-20T10:00:00Z', amount: 50 }, // vraie transaction du lundi
    ];

    expect(totalForDay(transactions, '19/07/2026')).toBe(100);
    expect(totalForDay(transactions, '20/07/2026')).toBe(50);
  });
});
