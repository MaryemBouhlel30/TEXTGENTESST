/**
 * File de traitement de commandes en parallèle.
 *
 * BUG CONNU (Lab 7 — Bug #3, race condition async) : `processOrder` lit
 * `processedCount` puis, après un `await` intermédiaire, écrit
 * `current + 1`. Quand plusieurs commandes sont traitées en parallèle
 * (`processAll` via `Promise.all`), deux appels peuvent lire la même valeur
 * avant que l'un des deux n'écrive — un incrément est alors perdu.
 * Symptôme : le compteur final est parfois correct, parfois inférieur au
 * nombre réel de commandes traitées — intermittent, dépend du timing.
 */

export interface Order {
  id: string;
  amount: number;
}

export class OrderQueue {
  private processedCount = 0;
  private processedOrders: Order[] = [];

  async processOrder(order: Order): Promise<void> {
    // Simule un traitement asynchrone (appel API, écriture DB...)
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 15));

    const current = this.processedCount; // lecture
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 15)); // fenêtre de course
    this.processedCount = current + 1; // écriture : incrément potentiellement perdu

    this.processedOrders.push(order);
  }

  async processAll(orders: Order[]): Promise<void> {
    await Promise.all(orders.map((o) => this.processOrder(o)));
  }

  getProcessedCount(): number {
    return this.processedCount;
  }

  getProcessedOrders(): Order[] {
    return this.processedOrders;
  }
}
