package com.neoxam.batch;

import java.util.List;

/**
 * Service de traitement par lot des rapports — module Java de TextGen Hub.
 *
 * BUG CONNU (Bug #5, volet Java) : aggregateTotal() cumule les montants
 * dans un double. Les nombres à virgule flottante ne représentent pas
 * exactement les valeurs décimales (0.1, 0.2, ...) : sur un grand nombre
 * de lignes, les erreurs d'arrondi s'accumulent et le total final dérive
 * de quelques centimes par rapport à la somme "attendue" au sens
 * comptable. Reproductible de façon déterministe avec suffisamment de
 * lignes (voir BatchReportServiceTest).
 *
 * Ne pas corriger avant le lab de débogage dédié.
 */
public class BatchReportService {

    public double aggregateTotal(List<ReportLine> lines) {
        double total = 0.0;
        for (ReportLine line : lines) {
            total += line.getAmount();
        }
        return total;
    }

    public String renderPlainText(String reportTitle, List<ReportLine> lines) {
        StringBuilder sb = new StringBuilder();
        sb.append("=== ").append(reportTitle).append(" ===\n");
        for (ReportLine line : lines) {
            sb.append(String.format("%s: %.2f %s%n", line.getLabel(), line.getAmount(), "\u20AC"));
        }
        sb.append(String.format("TOTAL: %.2f %s", aggregateTotal(lines), "\u20AC"));
        return sb.toString();
    }
}
