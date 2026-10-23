import { CouponError } from "../errors.js";

// Parse a timestamp without a UTC offset, such as 2030-01-01T00:00:00.
function parseLocalTimestamp(value) {
const localTimestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z?$/u;  if (!localTimestamp.test(value)) {
    throw new RangeError(`invalid local timestamp: ${value}`);
  }
  return new Date(value);
}

export function applyCoupon(store, code, totalCents) {
  try{
  const coupon = store.getCoupon(code);
  if (coupon === undefined) {
    throw new CouponError(`unknown coupon code: ${code}`);
  }

  const expiresAt = parseLocalTimestamp(coupon.expiresAt);
  if (expiresAt < new Date()) {
    throw new CouponError(`coupon has expired: ${code}`);
  }

  const discount = Math.floor((totalCents * coupon.percentOff) / 100);
  return totalCents - discount;
} catch (error) {
  throw error;
}
}
