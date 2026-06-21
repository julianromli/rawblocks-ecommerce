import { neon } from '@neondatabase/serverless';

// On Cloudflare Workers there is no process.env; secrets arrive via `env`
// (bound from wrangler.toml / `wrangler secret`). The Neon client must be
// created per-request from the request-scoped env rather than at module load.
export const getSql = (env) => {
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for Neon database access.');
  }
  return neon(databaseUrl);
};

export const mapProduct = (product) => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  description: product.description,
  price: product.price_cents / 100,
  originalPrice: product.original_price_cents ? product.original_price_cents / 100 : null,
  image: product.image_url,
  isNew: product.is_new,
  isActive: product.is_active,
  sortOrder: product.sort_order,
});

export const mapCartItem = (item) => ({
  ...mapProduct(item),
  quantity: item.quantity,
});
