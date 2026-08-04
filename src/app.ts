import express from 'express';
import path from 'path';
import { registerUser, login } from './services/auth.service';
import { calculateTTC, Invoice } from './services/invoice.service';
import { LegacyRenderer, ReportType } from './legacy/LegacyRenderer';
import { generate as generateText } from './services/template.service';
import { generateSummaryReport } from './services/summary.service';

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Compte de démo (utile pour les ateliers E2E)
  // NB : à cause du Bug #1 (auth.service), la connexion échoue toujours
  // tant que le bug n'est pas corrigé — comportement volontaire.
  registerUser('demo', 'password123');

  app.post('/api/login', (req, res) => {
    const { username, password } = req.body ?? {};
    try {
      const user = login(username, password);
      res.json({ ok: true, username: user.username });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      res.status(401).json({ ok: false, error: message });
    }
  });

  app.post('/api/templates/render', (req, res) => {
    const { template, context } = req.body ?? {};
    if (typeof template !== 'string') {
      res.status(400).json({ error: 'Le champ "template" (string) est requis' });
      return;
    }
    const result = generateText(template, context ?? {});
    res.json(result);
  });

  // [DEV: MBH] [DATE: 2026-08-04] [JIRA: JIRA-123]
  app.post('/api/summary', (req, res) => {
    const { text } = req.body ?? {};
    if (typeof text !== 'string') {
      res.status(400).json({ error: 'Le champ "text" (string) est requis' });
      return;
    }
    const { report, errors } = generateSummaryReport(text);
    res.json({ report, errors });
  });

  app.get('/api/reports/:type', (req, res) => {
    const renderer = new LegacyRenderer();
    const lines = [
      { label: 'Ventes', amount: 1200.5 },
      { label: 'Services', amount: 340.0 },
    ];
    try {
      const content = renderer.generate(req.params.type as ReportType, lines);
      res.type('text/plain').send(content);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      res.status(400).json({ error: message });
    }
  });

  app.get('/api/invoices/demo', (_req, res) => {
    const invoice: Invoice = {
      id: 'INV-001',
      amountHT: 1000,
      vatRate: 0.2,
      status: 'sent',
      dueDate: new Date('2026-06-01'),
    };
    res.json({ ttc: calculateTTC(invoice) });
  });

  return app;
}
