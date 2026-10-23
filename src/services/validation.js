// Problems found in submitted orders are collected here.

export function validateItems(store, items) {
  const problems = [];

  if (!Array.isArray(items) || items.length === 0) {
    problems.push("order must contain at least one item");
    return problems;
  }

  for (const item of items) {
    if (item.quantity <= 0) {
      problems.push(
        `quantity must be positive for product ${item.product_id}`,
      );
    } else if (store.getProduct(item.product_id) === undefined) {
      problems.push(`product ${item.product_id} does not exist`);
    }
  }
  return problems;
}
