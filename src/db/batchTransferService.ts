import { getConnection } from '../db';

/**
 * Transfert de fonds entre deux comptes.
 *
 * BUG CONNU (Bug #4, verrou mutuel / deadlock SQL) : deux transferts
 * concurrents en sens opposé (A→B et B→A) verrouillent chacun leur ligne de
 * débit avant de tenter de verrouiller la ligne de crédit. Sous charge
 * concurrente, chaque transaction attend un verrou détenu par l'autre.
 * Symptôme : erreur SQLITE_BUSY / "database table is locked" intermittente,
 * uniquement quand deux transferts opposés se chevauchent dans le temps.
 * Logs de la base à fournir aux participants pour l'analyse (module de débogage dédié).
 */

export function transfer(fromId: number, toId: number, amount: number): void {
  const db = getConnection(100); // timeout court : le verrou expire vite, l'erreur devient visible

  db.prepare('BEGIN IMMEDIATE').run();
  try {
    const from = db.prepare('SELECT balance FROM accounts WHERE id = ?').get(fromId) as
      | { balance: number }
      | undefined;
    if (!from || from.balance < amount) {
      throw new Error('Solde insuffisant');
    }

    // Verrou pris sur le compte débité en premier...
    db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(amount, fromId);

    // ... délai métier simulé avant de verrouiller le compte crédité
    // (dans un vrai système : appel à un service de frais, anti-fraude, etc.)
    const busyUntil = Date.now() + 300;
    while (Date.now() < busyUntil) {
      /* travail simulé */
    }

    db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(amount, toId);
    db.prepare('COMMIT').run();
  } catch (err) {
    db.prepare('ROLLBACK').run();
    throw err;
  } finally {
    db.close();
  }
}
