import { requireAdmin, handleApiError } from '../_lib/auth.js';
import { mapProduct, sql } from '../_lib/db.js';
import { assertMethod, readJson, sendJson } from '../_lib/http.js';

const createSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const productFromBody = (body) => {
  const name = String(body.name || '').trim();
  const description = String(body.description || '').trim();
  const image = String(body.image || '').trim();
  const price = Number(body.price);
  const originalPrice = body.originalPrice === '' || body.originalPrice == null ? null : Number(body.originalPrice);

  if (!name || !description || !image || !Number.isFinite(price) || price < 0) {
    const error = new Error('Product name, description, image, and valid price are required.');
    error.status = 400;
    throw error;
  }

  if (originalPrice !== null && (!Number.isFinite(originalPrice) || originalPrice < price)) {
    const error = new Error('Original price must be greater than or equal to price.');
    error.status = 400;
    throw error;
  }

  return {
    name,
    slug: body.slug ? createSlug(String(body.slug)) : createSlug(name),
    description,
    priceCents: Math.round(price * 100),
    originalPriceCents: originalPrice === null ? null : Math.round(originalPrice * 100),
    image,
    isNew: Boolean(body.isNew),
    isActive: body.isActive !== false,
  };
};

export default async function handler(req, res) {
  if (!assertMethod(req, res, ['GET', 'POST'])) return;

  try {
    if (req.method === 'GET') {
      const includeInactive = req.query.includeInactive === 'true';

      if (includeInactive) {
        await requireAdmin(req);
      }

      const products = includeInactive
        ? await sql`select * from products order by created_at desc`
        : await sql`select * from products where is_active = true order by created_at desc`;

      sendJson(res, 200, { products: products.map(mapProduct) });
      return;
    }

    await requireAdmin(req);
    const product = productFromBody(await readJson(req));
    const [created] = await sql`
      insert into products (name, slug, description, price_cents, original_price_cents, image_url, is_new, is_active)
      values (
        ${product.name},
        ${product.slug},
        ${product.description},
        ${product.priceCents},
        ${product.originalPriceCents},
        ${product.image},
        ${product.isNew},
        ${product.isActive}
      )
      returning *
    `;

    sendJson(res, 201, { product: mapProduct(created) });
  } catch (error) {
    handleApiError(res, error);
  }
}
