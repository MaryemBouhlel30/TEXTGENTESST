import { calculateTTC, Invoice } from '../src/services/invoice.service';

describe('calculateTTC', () => {
  it('calcule le TTC avec un taux de TVA standard', () => {
    const invoice: Invoice = {
      id: 'INV-1',
      amountHT: 100,
      vatRate: 0.2,
      status: 'sent',
      dueDate: new Date('2026-12-01'),
    };
    expect(calculateTTC(invoice)).toBe(120);
  });
});

// Volontairement absent : tests pour isOverdue, applyLatePenalty,
// canBeCancelled, nextStatus -> couverture initiale < 20% (objectif Lab 9).
