// Order pricing rules (INR). Shared by cart and checkout so totals always match.
export const FREE_DELIVERY_THRESHOLD = 999;
export const DELIVERY_CHARGE = 99;

export function calcTotals(subtotal: number) {
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  return { subtotal, delivery, total: subtotal + delivery };
}
