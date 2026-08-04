// [DEV: MBH] [DATE: 2026-08-04] [JIRA: JIRA-123]
package com.neoxam.batch;

/**
 * Synthèse chiffrée d'une liste de lignes : nombre de lignes, total,
 * moyenne, ligne minimale et ligne maximale (null si la liste est vide).
 */
public class Summary {

    private final int count;
    private final double total;
    private final double average;
    private final ReportLine min;
    private final ReportLine max;

    public Summary(int count, double total, double average, ReportLine min, ReportLine max) {
        this.count = count;
        this.total = total;
        this.average = average;
        this.min = min;
        this.max = max;
    }

    public int getCount() {
        return count;
    }

    public double getTotal() {
        return total;
    }

    public double getAverage() {
        return average;
    }

    public ReportLine getMin() {
        return min;
    }

    public ReportLine getMax() {
        return max;
    }
}
