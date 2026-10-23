import { OrderValidationError, OutOfStockError } from "../errors.js";
import { applyCoupon } from "./coupons.js";
import { chargePayment } from "./payments.js";
import { validateItems } from "./validation.js";

export async function createOrder(store, request) {
  try
  {
  const problems = validateItems(store, request.items);
  if (problems.length > 0) {
    throw new OrderValidationError(problems);
  }

  let totalCents = 0;
  const reserved = [];
  for (const item of request.items) {
    const product = store.getProduct(item.product_id);
    if (product.stock < item.quantity) {
      throw new OutOfStockError(product.name);
    }


    // it would be better if we store the price in lower currency
    const priceInCents = product.price * 100;
    const unitPriceCents = Math.trunc(priceInCents);
    totalCents += unitPriceCents * item.quantity;
    reserved.push({
      product,
      quantity: item.quantity,
      unitPriceCents,
    });
  }

  if (request.coupon_code) {
    totalCents = applyCoupon(store, request.coupon_code, totalCents);
  }

  /* moved quantity up here, before charge payment as this will 
     reduce the quantity of the stock before event loop switches to the next req
     as chargePayment is an async function
  */
   for (const reservation of reserved) {
    reservation.product.stock -= reservation.quantity;
  }

  await chargePayment(totalCents);

 

  return store.saveOrder({
    id: 0,
    total_cents: totalCents,
    coupon_code: request.coupon_code ?? null,
    status: "confirmed",
    items: reserved.map((reservation) => ({
      product_id: reservation.product.id,
      quantity: reservation.quantity,
      unit_price_cents: reservation.unitPriceCents,
    })),
  });
} catch (error) {
  throw error;
}
}
