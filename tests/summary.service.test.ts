// [DEV: MBH] [DATE: 2026-08-04] [JIRA: JIRA-123]

import { parseLines, summarize, generateSummaryReport } from '../src/services/summary.service';

describe('parseLines', () => {
  it('parse correctement les lignes valides au format "label: montant"', () => {
    const { lines, errors } = parseLines('Ventes: 1200.50\nServices: 340.00');
    expect(errors).toEqual([]);
    expect(lines).toEqual([
      { label: 'Ventes', amount: 1200.5 },
      { label: 'Services', amount: 340.0 },
    ]);
  });

  it('ignore les lignes vides ou ne contenant que des espaces', () => {
    const { lines, errors } = parseLines('Ventes: 100\n\n   \nServices: 50');
    expect(errors).toEqual([]);
    expect(lines).toEqual([
      { label: 'Ventes', amount: 100 },
      { label: 'Services', amount: 50 },
    ]);
  });

  it('retire les espaces superflus autour du label et du montant', () => {
    const { lines, errors } = parseLines('   Ventes   :    1200.50   ');
    expect(errors).toEqual([]);
    expect(lines).toEqual([{ label: 'Ventes', amount: 1200.5 }]);
  });

  it('accepte les montants décimaux et négatifs', () => {
    const { lines, errors } = parseLines('Remise: -50.25\nAjustement: 0.5');
    expect(errors).toEqual([]);
    expect(lines).toEqual([
      { label: 'Remise', amount: -50.25 },
      { label: 'Ajustement', amount: 0.5 },
    ]);
  });

  it('signale en erreur (avec numéro de ligne) toute ligne sans ":", sans lever d\'exception', () => {
    expect(() => parseLines('Ventes: 100\nLigne sans separateur\nServices: 50')).not.toThrow();
    const { lines, errors } = parseLines('Ventes: 100\nLigne sans separateur\nServices: 50');
    expect(lines).toEqual([
      { label: 'Ventes', amount: 100 },
      { label: 'Services', amount: 50 },
    ]);
    expect(errors).toEqual([{ line: 2, message: expect.stringContaining('Ligne malformée') }]);
  });

  it('signale en erreur (avec numéro de ligne) tout montant non numérique, sans lever d\'exception', () => {
    expect(() => parseLines('Ventes: abc')).not.toThrow();
    const { lines, errors } = parseLines('Ventes: 100\nServices: abc');
    expect(lines).toEqual([{ label: 'Ventes', amount: 100 }]);
    expect(errors).toEqual([{ line: 2, message: expect.stringContaining('Montant non numérique') }]);
  });
});

describe('summarize', () => {
  it('calcule correctement total, nombre de lignes, moyenne, min et max sur plusieurs lignes', () => {
    const summary = summarize([
      { label: 'Ventes', amount: 1200.5 },
      { label: 'Services', amount: 340.0 },
      { label: 'Remise', amount: -50.25 },
    ]);
    expect(summary.count).toBe(3);
    expect(summary.total).toBeCloseTo(1490.25);
    expect(summary.average).toBeCloseTo(496.75);
    expect(summary.min).toEqual({ label: 'Remise', amount: -50.25 });
    expect(summary.max).toEqual({ label: 'Ventes', amount: 1200.5 });
  });

  it('renvoie moyenne 0 et min/max null sur une liste vide, sans exception', () => {
    expect(() => summarize([])).not.toThrow();
    const summary = summarize([]);
    expect(summary).toEqual({ count: 0, total: 0, average: 0, min: null, max: null });
  });
});

describe('generateSummaryReport', () => {
  it('produit un texte de rapport formaté cohérent (titre, lignes, total/moyenne/min/max)', () => {
    const { report } = generateSummaryReport('Ventes: 1200.50\nServices: 340.00');
    expect(report).toContain('RAPPORT DE SYNTHÈSE');
    expect(report).toContain('Ventes: 1200.50');
    expect(report).toContain('Services: 340.00');
    expect(report).toContain('Nombre de lignes: 2');
    expect(report).toContain('Total: 1540.50');
    expect(report).toContain('Moyenne: 770.25');
    expect(report).toContain('Min: Services: 340.00');
    expect(report).toContain('Max: Ventes: 1200.50');
  });

  it('renvoie les erreurs de parsing en plus du rapport, sans bloquer la génération', () => {
    const { report, errors } = generateSummaryReport('Ventes: 1200.50\nLigne invalide\nServices: abc');
    expect(report).toContain('Ventes: 1200.50');
    expect(report).toContain('Nombre de lignes: 1');
    expect(errors).toHaveLength(2);
    expect(errors[0].line).toBe(2);
    expect(errors[1].line).toBe(3);
  });

  it('gère un texte vide sans erreur : 0 ligne, total 0, moyenne 0, min/max N/A', () => {
    const { report, errors } = generateSummaryReport('');
    expect(errors).toEqual([]);
    expect(report).toContain('Nombre de lignes: 0');
    expect(report).toContain('Total: 0.00');
    expect(report).toContain('Moyenne: 0.00');
    expect(report).toContain('Min: N/A');
    expect(report).toContain('Max: N/A');
  });
});

describe('generateSummaryReport - cohérence arrondi lignes vs total', () => {
  // Générateur déterministe (LCG) pour produire des montants à précision variable
  // (2 à 4 décimales), simulant des données reçues via POST /api/summary depuis
  // une source externe (export, calcul en amont) qui n'arrondit pas à 2 décimales.
  function randomAmount(seed: number): number {
    seed = (seed * 9301 + 49297) % 233280;
    const base = (seed / 233280) * 200 - 50;
    const decimals = 2 + (seed % 3);
    return Number(base.toFixed(decimals));
  }

  it("la somme des montants affichés (2 décimales) par ligne doit être égale au Total affiché", () => {
    const n = 500;
    const text = Array.from({ length: n }, (_, i) => `L${i}: ${randomAmount(i + 1)}`).join('\n');

    const { report } = generateSummaryReport(text);

    const displayedLineAmounts = report
      .split('\n')
      .filter((l) => /^L\d+:/.test(l))
      .map((l) => Number(l.split(': ')[1]));
    const sumOfDisplayed = Math.round(displayedLineAmounts.reduce((s, a) => s + a, 0) * 100) / 100;

    const totalDisplayed = Number(report.match(/Total: ([\d.-]+)/)![1]);

    // Reproduit le Bug #5 : le Total est calculé sur les montants bruts non
    // arrondis, alors que chaque ligne est affichée arrondie à 2 décimales —
    // réadditionner les lignes du rapport ne redonne pas le Total affiché.
    expect(totalDisplayed).toBeCloseTo(sumOfDisplayed, 2);
  });
});
