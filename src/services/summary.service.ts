// [DEV: MBH] [DATE: 2026-08-04] [JIRA: JIRA-123]

/**
 * Service de synthèse à partir d'une liste de lignes en texte brut.
 *
 * Format de ligne attendu : "label: montant" (ex. "Ventes: 1200.50").
 * Agrégation purement déterministe (total, comptage, moyenne, min, max),
 * sans appel LLM.
 */

export interface ParsedLine {
  label: string;
  amount: number;
}

export interface ParseError {
  line: number;
  message: string;
}

export interface ParseResult {
  lines: ParsedLine[];
  errors: ParseError[];
}

export interface Summary {
  count: number;
  total: number;
  average: number;
  min: ParsedLine | null;
  max: ParsedLine | null;
}

export interface SummaryReportResult {
  report: string;
  errors: ParseError[];
}

export function parseLines(text: string): ParseResult {
  const lines: ParsedLine[] = [];
  const errors: ParseError[] = [];

  const rawLines = text.split(/\r?\n/);

  rawLines.forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const trimmedLine = rawLine.trim();

    if (trimmedLine === '') {
      return;
    }

    const separatorIndex = trimmedLine.indexOf(':');
    if (separatorIndex === -1) {
      errors.push({ line: lineNumber, message: `Ligne malformée : séparateur ":" absent dans "${trimmedLine}"` });
      return;
    }

    const label = trimmedLine.slice(0, separatorIndex).trim();
    const rawAmount = trimmedLine.slice(separatorIndex + 1).trim();
    const amount = Number(rawAmount);

    if (rawAmount === '' || Number.isNaN(amount)) {
      errors.push({ line: lineNumber, message: `Montant non numérique : "${rawAmount}"` });
      return;
    }

    lines.push({ label, amount });
  });

  return { lines, errors };
}

export function summarize(lines: ParsedLine[]): Summary {
  const count = lines.length;

  if (count === 0) {
    return { count: 0, total: 0, average: 0, min: null, max: null };
  }

  let total = 0;
  let min = lines[0];
  let max = lines[0];

  for (const line of lines) {
    total += line.amount;
    if (line.amount < min.amount) min = line;
    if (line.amount > max.amount) max = line;
  }

  return { count, total, average: total / count, min, max };
}

export function generateSummaryReport(text: string): SummaryReportResult {
  const { lines, errors } = parseLines(text);
  const summary = summarize(lines);

  const formatLine = (line: ParsedLine) => `${line.label}: ${line.amount.toFixed(2)}`;

  const reportLines = [
    '=== RAPPORT DE SYNTHÈSE ===',
    ...lines.map(formatLine),
    '---',
    `Nombre de lignes: ${summary.count}`,
    `Total: ${summary.total.toFixed(2)}`,
    `Moyenne: ${summary.average.toFixed(2)}`,
    `Min: ${summary.min ? formatLine(summary.min) : 'N/A'}`,
    `Max: ${summary.max ? formatLine(summary.max) : 'N/A'}`,
  ];

  return { report: reportLines.join('\n'), errors };
}
