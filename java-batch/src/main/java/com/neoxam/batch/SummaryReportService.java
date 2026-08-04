// [DEV: MBH] [DATE: 2026-08-04] [JIRA: JIRA-123]
package com.neoxam.batch;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Service de synthèse à partir d'une liste de lignes en texte brut —
 * portage Java de src/services/summary.service.ts (spec
 * specs/rapport-synthese.md). Le module batch n'exposant pas de serveur
 * HTTP, seule la logique d'agrégation est portée (pas de route Express
 * équivalente).
 *
 * Format de ligne attendu : "label: montant" (ex. "Ventes: 1200.50").
 * Agrégation purement déterministe (total, comptage, moyenne, min, max),
 * sans appel LLM.
 */
public class SummaryReportService {

    public ParseResult parseLines(String text) {
        List<ReportLine> lines = new ArrayList<>();
        List<ParseError> errors = new ArrayList<>();

        String[] rawLines = text.split("\r?\n");

        for (int index = 0; index < rawLines.length; index++) {
            int lineNumber = index + 1;
            String trimmedLine = rawLines[index].trim();

            if (trimmedLine.isEmpty()) {
                continue;
            }

            int separatorIndex = trimmedLine.indexOf(':');
            if (separatorIndex == -1) {
                errors.add(new ParseError(lineNumber,
                        "Ligne malformée : séparateur \":\" absent dans \"" + trimmedLine + "\""));
                continue;
            }

            String label = trimmedLine.substring(0, separatorIndex).trim();
            String rawAmount = trimmedLine.substring(separatorIndex + 1).trim();

            double amount;
            try {
                amount = Double.parseDouble(rawAmount);
            } catch (NumberFormatException e) {
                amount = Double.NaN;
            }

            if (rawAmount.isEmpty() || Double.isNaN(amount)) {
                errors.add(new ParseError(lineNumber, "Montant non numérique : \"" + rawAmount + "\""));
                continue;
            }

            lines.add(new ReportLine(label, amount));
        }

        return new ParseResult(lines, errors);
    }

    public Summary summarize(List<ReportLine> lines) {
        int count = lines.size();

        if (count == 0) {
            return new Summary(0, 0.0, 0.0, null, null);
        }

        double total = 0.0;
        ReportLine min = lines.get(0);
        ReportLine max = lines.get(0);

        for (ReportLine line : lines) {
            total += line.getAmount();
            if (line.getAmount() < min.getAmount()) {
                min = line;
            }
            if (line.getAmount() > max.getAmount()) {
                max = line;
            }
        }

        return new Summary(count, total, total / count, min, max);
    }

    public SummaryReportResult generateSummaryReport(String text) {
        ParseResult parseResult = parseLines(text);
        Summary summary = summarize(parseResult.getLines());

        List<String> reportLines = new ArrayList<>();
        reportLines.add("=== RAPPORT DE SYNTHÈSE ===");
        for (ReportLine line : parseResult.getLines()) {
            reportLines.add(formatLine(line));
        }
        reportLines.add("---");
        reportLines.add("Nombre de lignes: " + summary.getCount());
        reportLines.add(String.format(Locale.ROOT, "Total: %.2f", summary.getTotal()));
        reportLines.add(String.format(Locale.ROOT, "Moyenne: %.2f", summary.getAverage()));
        reportLines.add("Min: " + (summary.getMin() != null ? formatLine(summary.getMin()) : "N/A"));
        reportLines.add("Max: " + (summary.getMax() != null ? formatLine(summary.getMax()) : "N/A"));

        return new SummaryReportResult(String.join("\n", reportLines), parseResult.getErrors());
    }

    private String formatLine(ReportLine line) {
        return String.format(Locale.ROOT, "%s: %.2f", line.getLabel(), line.getAmount());
    }
}
