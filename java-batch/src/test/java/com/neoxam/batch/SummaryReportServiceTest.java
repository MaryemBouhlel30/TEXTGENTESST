// [DEV: MBH] [DATE: 2026-08-04] [JIRA: JIRA-123]
package com.neoxam.batch;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SummaryReportServiceTest {

    private final SummaryReportService service = new SummaryReportService();

    @Test
    void parseLinesParseLesLignesValides() {
        ParseResult result = service.parseLines("Ventes: 1200.50\nServices: 340");

        assertEquals(2, result.getLines().size());
        assertEquals(0, result.getErrors().size());
        assertEquals("Ventes", result.getLines().get(0).getLabel());
        assertEquals(1200.50, result.getLines().get(0).getAmount());
        assertEquals("Services", result.getLines().get(1).getLabel());
        assertEquals(340.0, result.getLines().get(1).getAmount());
    }

    @Test
    void parseLinesIgnoreLesLignesVidesOuBlanches() {
        ParseResult result = service.parseLines("Ventes: 100\n\n   \nServices: 50");

        assertEquals(2, result.getLines().size());
        assertEquals(0, result.getErrors().size());
    }

    @Test
    void parseLinesRetireLesEspacesSuperflus() {
        ParseResult result = service.parseLines("   Ventes   :   100.5   ");

        assertEquals("Ventes", result.getLines().get(0).getLabel());
        assertEquals(100.5, result.getLines().get(0).getAmount());
    }

    @Test
    void parseLinesAccepteLesMontantsDecimauxEtNegatifs() {
        ParseResult result = service.parseLines("Remise: -25.75\nAjustement: 0.01");

        assertEquals(-25.75, result.getLines().get(0).getAmount());
        assertEquals(0.01, result.getLines().get(1).getAmount());
    }

    @Test
    void parseLinesSignaleUneLigneSansSeparateurAvecSonNumero() {
        ParseResult result = service.parseLines("Ventes 100");

        assertEquals(0, result.getLines().size());
        assertEquals(1, result.getErrors().size());
        assertEquals(1, result.getErrors().get(0).getLine());
    }

    @Test
    void parseLinesSignaleUnMontantNonNumeriqueAvecSonNumero() {
        ParseResult result = service.parseLines("Ventes: abc");

        assertEquals(0, result.getLines().size());
        assertEquals(1, result.getErrors().size());
        assertEquals(1, result.getErrors().get(0).getLine());
    }

    @Test
    void parseLinesGereLesLignesMalformeesMelangeesAuxLignesValidesSansException() {
        ParseResult result = service.parseLines("Ventes: 100\nPasDeSeparateur\nServices: xyz\nAchats: 50");

        assertEquals(2, result.getLines().size());
        assertEquals(2, result.getErrors().size());
        assertEquals(2, result.getErrors().get(0).getLine());
        assertEquals(3, result.getErrors().get(1).getLine());
    }

    @Test
    void summarizeCalculeTotalCompteMoyenneMinEtMax() {
        List<ReportLine> lines = List.of(
                new ReportLine("Ventes", 100.0),
                new ReportLine("Services", 300.0),
                new ReportLine("Achats", -50.0)
        );

        Summary summary = service.summarize(lines);

        assertEquals(3, summary.getCount());
        assertEquals(350.0, summary.getTotal());
        assertEquals(350.0 / 3, summary.getAverage());
        assertEquals("Achats", summary.getMin().getLabel());
        assertEquals("Services", summary.getMax().getLabel());
    }

    @Test
    void summarizeSurListeVideRenvoieMoyenneZeroEtMinMaxNulsSansException() {
        Summary summary = service.summarize(List.of());

        assertEquals(0, summary.getCount());
        assertEquals(0.0, summary.getTotal());
        assertEquals(0.0, summary.getAverage());
        assertNull(summary.getMin());
        assertNull(summary.getMax());
    }

    @Test
    void generateSummaryReportProduitUnRapportFormateCoherent() {
        SummaryReportResult result = service.generateSummaryReport("Ventes: 100\nServices: 300");

        assertTrue(result.getReport().contains("RAPPORT DE SYNTHÈSE"));
        assertTrue(result.getReport().contains("Ventes: 100.00"));
        assertTrue(result.getReport().contains("Nombre de lignes: 2"));
        assertTrue(result.getReport().contains("Total: 400.00"));
        assertTrue(result.getReport().contains("Moyenne: 200.00"));
        assertEquals(0, result.getErrors().size());
    }

    @Test
    void generateSummaryReportRenvoieLesErreursDeParsingSansBloquerLeRapport() {
        SummaryReportResult result = service.generateSummaryReport("Ventes: 100\nLigneInvalide");

        assertTrue(result.getReport().contains("Ventes: 100.00"));
        assertEquals(1, result.getErrors().size());
        assertEquals(2, result.getErrors().get(0).getLine());
    }

    @Test
    void generateSummaryReportSurTexteVideIndiqueZeroLigneSansErreur() {
        SummaryReportResult result = service.generateSummaryReport("");

        assertTrue(result.getReport().contains("Nombre de lignes: 0"));
        assertTrue(result.getReport().contains("Min: N/A"));
        assertTrue(result.getReport().contains("Max: N/A"));
        assertEquals(0, result.getErrors().size());
    }
}
