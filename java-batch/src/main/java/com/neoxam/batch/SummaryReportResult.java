// [DEV: MBH] [DATE: 2026-08-04] [JIRA: JIRA-123]
package com.neoxam.batch;

import java.util.List;

/**
 * Résultat de la génération d'un rapport de synthèse : le texte du
 * rapport et les erreurs de parsing rencontrées.
 */
public class SummaryReportResult {

    private final String report;
    private final List<ParseError> errors;

    public SummaryReportResult(String report, List<ParseError> errors) {
        this.report = report;
        this.errors = errors;
    }

    public String getReport() {
        return report;
    }

    public List<ParseError> getErrors() {
        return errors;
    }
}
