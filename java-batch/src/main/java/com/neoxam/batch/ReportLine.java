package com.neoxam.batch;

/**
 * Une ligne de rapport à agréger par le traitement batch.
 * Miroir volontaire de l'interface ReportLine côté TypeScript
 * (src/legacy/LegacyRenderer.ts), pour illustrer un même concept
 * métier porté dans deux langages du dépôt.
 */
public class ReportLine {

    private final String label;
    private final double amount;

    public ReportLine(String label, double amount) {
        this.label = label;
        this.amount = amount;
    }

    public String getLabel() {
        return label;
    }

    public double getAmount() {
        return amount;
    }
}
