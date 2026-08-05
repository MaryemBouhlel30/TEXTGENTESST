import { Worker } from 'worker_threads';
import path from 'path';
import Database from 'better-sqlite3';
import { initDb } from '../src/db';

const DB_PATH = path.join(__dirname, '..', 'data.db');
const WORKER_PATH = path.join(__dirname, '..', 'transferWorker.ts');

interface TransferResult {
  ok: boolean;
  error?: string;
}

function runTransfer(fromId: number, toId: number, amount: number): Promise<TransferResult> {
  return new Promise((resolve) => {
    const worker = new Worker(WORKER_PATH, {
      workerData: { fromId, toId, amount },
      execArgv: ['-r', 'ts-node/register'],
    });
    worker.on('message', (msg) => resolve(msg));
    worker.on('exit', () => resolve({ ok: false, error: 'worker exited sans message' }));
  });
}

function getBalances(): { alice: number; bob: number } {
  const db = new Database(DB_PATH);
  const alice = (db.prepare('SELECT balance FROM accounts WHERE id = 1').get() as { balance: number }).balance;
  const bob = (db.prepare('SELECT balance FROM accounts WHERE id = 2').get() as { balance: number }).balance;
  db.close();
  return { alice, bob };
}

describe('batchTransferService - transferts opposés concurrents', () => {
  it('réussit les deux transferts sans "database is locked" (répété sur plusieurs runs)', async () => {
    const N_RUNS = 5;
    const failures: Array<{ run: number; results: TransferResult[] }> = [];

    for (let run = 0; run < N_RUNS; run++) {
      initDb(); // Alice(1)=1000, Bob(2)=1000

      const [r1, r2] = await Promise.all([
        runTransfer(1, 2, 50),
        runTransfer(2, 1, 50),
      ]);

      if (!r1.ok || !r2.ok) {
        failures.push({ run, results: [r1, r2] });
      } else {
        // Les deux transferts opposés de 50 doivent se compenser exactement.
        expect(getBalances()).toEqual({ alice: 1000, bob: 1000 });
      }
    }

    expect(failures).toEqual([]);
  }, 60000);
});
