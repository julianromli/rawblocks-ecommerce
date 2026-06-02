import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required for Neon database access.');
}

export const sql = neon(databaseUrl);

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
});

export const mapCartItem = (item) => ({
  ...mapProduct(item),
  quantity: item.quantity,
});
