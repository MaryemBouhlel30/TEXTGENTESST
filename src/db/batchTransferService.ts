import { getConnection } from '../db';

/**
 * Transfert de fonds entre deux comptes.
 *
 * SQLite (mode rollback-journal) ne verrouille pas ligne par ligne : un seul
 * writer peut détenir le verrou d'écriture sur toute la base à la fois.
 * `BEGIN IMMEDIATE` attend ce verrou jusqu'à `timeout` ms avant d'abandonner
 * (SQLITE_BUSY / "database is locked") — le timeout doit donc couvrir la
 * durée réelle d'une transaction concurrente, pas juste l'acquisition.
 */

export function transfer(fromId: number, toId: number, amount: number): void {
  const db = getConnection(5000); // couvre largement la durée d'une transaction concurrente

  try {
    db.prepare('BEGIN IMMEDIATE').run();
    try {
      const from = db.prepare('SELECT balance FROM accounts WHERE id = ?').get(fromId) as
        | { balance: number }
        | undefined;
      if (!from || from.balance < amount) {
        throw new Error('Solde insuffisant');
      }

      db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(amount, fromId);

      // délai métier simulé (dans un vrai système : appel à un service de frais, anti-fraude, etc.)
      const busyUntil = Date.now() + 300;
      while (Date.now() < busyUntil) {
        /* travail simulé */
      }

      db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(amount, toId);
      db.prepare('COMMIT').run();
    } catch (err) {
      db.prepare('ROLLBACK').run();
      throw err;
    }
  } finally {
    db.close(); // toujours exécuté, y compris si BEGIN IMMEDIATE lui-même échoue
  }
}
