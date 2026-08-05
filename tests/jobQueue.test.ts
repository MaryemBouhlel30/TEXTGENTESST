import { OrderQueue, Order } from '../src/async/jobQueue';

function makeOrders(n: number): Order[] {
  return Array.from({ length: n }, (_, i) => ({ id: `o${i}`, amount: 1 }));
}

describe('OrderQueue.processAll', () => {
  it("incrémente processedCount une fois par commande, même en parallèle (répété sur plusieurs runs)", async () => {
    const N_ORDERS = 30;
    const N_RUNS = 20;
    const mismatches: number[] = [];

    for (let run = 0; run < N_RUNS; run++) {
      const queue = new OrderQueue();
      const orders = makeOrders(N_ORDERS);

      await queue.processAll(orders);

      if (queue.getProcessedCount() !== N_ORDERS) {
        mismatches.push(run);
      }
      // Le tableau des commandes traitées (push synchrone) doit lui rester correct,
      // ce qui isole le bug sur le compteur et non sur le traitement lui-même.
      expect(queue.getProcessedOrders()).toHaveLength(N_ORDERS);
    }

    expect(mismatches).toEqual([]);
  });
});
