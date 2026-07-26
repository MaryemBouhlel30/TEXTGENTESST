package com.neoxam.batch;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Suite de tests volontairement incomplète (comme tests/invoice.service.test.ts
 * côté TypeScript) : seule la mise en forme est couverte. aggregateTotal()
 * n'est couvert par aucun test — à corriger dans le lab de débogage dédié.
 */
class BatchReportServiceTest {

    private final BatchReportService service = new BatchReportService();

    @Test
    void renderPlainTextContientLeTitreEtLesLignes() {
        List<ReportLine> lines = List.of(
                new ReportLine("Ventes", 1200.50),
                new ReportLine("Services", 340.00)
        );

        String result = service.renderPlainText("RAPPORT JOURNALIER", lines);

        assertTrue(result.contains("RAPPORT JOURNALIER"));
        assertTrue(result.contains("Ventes"));
        assertTrue(result.contains("Services"));
    }
}
