function positiveInteger(raw, fallback) {
  if (raw === null || raw === "") {
    return fallback;
  }
  const value = Number(raw);
  return Number.isInteger(value) && value >= 1 ? value : fallback;
}

export function listProducts(store, url) {
  const page = positiveInteger(url.searchParams.get("page"), 1);
  const pageSize = positiveInteger(url.searchParams.get("page_size"), 10);
  const all = store.listProducts();

  // since page no starts from 1 offset will be multiple of pagesize, slice would ignore
  // pageSize*1 no of products.
  //  products(page=1, size=20 then 20 products would be ignored )
  const offset = (page - 1) * pageSize;
  return {
    page,
    page_size: pageSize,
    items: all.slice(offset, offset + pageSize),
  };
}
