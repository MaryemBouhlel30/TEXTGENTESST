/**
 * Regroupement de transactions par jour.
 *
 * BUG CONNU (Lab 7 — Bug #2, timezone) : `groupByDay` utilise
 * `toLocaleDateString()` sur des timestamps UTC, ce qui applique le fuseau
 * horaire LOCAL du serveur. Pour un serveur dans un fuseau en avance sur UTC
 * (ex: UTC+1, UTC+2 — cas de la Tunisie/Europe), une transaction de dimanche
 * tard en heure UTC (ex: 23h30 UTC un dimanche) tombe après minuit en heure
 * locale et se retrouve comptée le lundi.
 * Symptôme rapporté : « les rapports du lundi sont faux » — ils contiennent
 * en réalité des transactions de la veille.
 */

export interface Transaction {
  timestampUTC: string; // ISO 8601 en UTC, ex: "2026-07-19T23:30:00Z"
  amount: number;
}

export function groupByDay(transactions: Transaction[]): Record<string, Transaction[]> {
  const groups: Record<string, Transaction[]> = {};
  for (const tx of transactions) {
    const date = new Date(tx.timestampUTC);
    const key = date.toLocaleDateString('fr-FR');
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  }
  return groups;
}

export function totalForDay(transactions: Transaction[], dayKey: string): number {
  const groups = groupByDay(transactions);
  const dayTx = groups[dayKey] || [];
  return dayTx.reduce((sum, tx) => sum + tx.amount, 0);
}
