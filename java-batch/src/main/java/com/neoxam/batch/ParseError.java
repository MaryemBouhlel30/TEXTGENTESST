// [DEV: MBH] [DATE: 2026-08-04] [JIRA: JIRA-123]
package com.neoxam.batch;

/**
 * Erreur de parsing d'une ligne de synthèse, avec son numéro de ligne
 * (1-indexé) et un message explicite.
 */
public class ParseError {

    private final int line;
    private final String message;

    public ParseError(int line, String message) {
        this.line = line;
        this.message = message;
    }

    public int getLine() {
        return line;
    }

    public String getMessage() {
        return message;
    }
}
