// [DEV: MBH] [DATE: 2026-08-04] [JIRA: JIRA-123]
package com.neoxam.batch;

import java.util.List;

/**
 * Résultat du parsing d'un texte brut : les lignes valides et les
 * erreurs de parsing rencontrées.
 */
public class ParseResult {

    private final List<ReportLine> lines;
    private final List<ParseError> errors;

    public ParseResult(List<ReportLine> lines, List<ParseError> errors) {
        this.lines = lines;
        this.errors = errors;
    }

    public List<ReportLine> getLines() {
        return lines;
    }

    public List<ParseError> getErrors() {
        return errors;
    }
}
