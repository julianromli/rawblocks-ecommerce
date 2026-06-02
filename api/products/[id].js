import { requireAdmin, handleApiError } from '../_lib/auth.js';
import { mapProduct, sql } from '../_lib/db.js';
import { assertMethod, readJson, sendJson } from '../_lib/http.js';

const productFromBody = (body) => {
  const name = String(body.name || '').trim();
  const slug = String(body.slug || name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const description = String(body.description || '').trim();
  const image = String(body.image || '').trim();
  const price = Number(body.price);
  const originalPrice = body.originalPrice === '' || body.originalPrice == null ? null : Number(body.originalPrice);

  if (!name || !slug || !description || !image || !Number.isFinite(price) || price < 0) {
    const error = new Error('Product name, slug, description, image, and valid price are required.');
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
    slug,
    description,
    priceCents: Math.round(price * 100),
    originalPriceCents: originalPrice === null ? null : Math.round(originalPrice * 100),
    image,
    isNew: Boolean(body.isNew),
    isActive: body.isActive !== false,
  };
};

export default async function handler(req, res) {
  if (!assertMethod(req, res, ['PATCH', 'DELETE'])) return;

  try {
    await requireAdmin(req);
    const { id } = req.query;

    if (req.method === 'DELETE') {
      const [deleted] = await sql`delete from products where id = ${id} returning *`;
      if (!deleted) {
        sendJson(res, 404, { error: 'Product not found' });
        return;
      }

      sendJson(res, 200, { product: mapProduct(deleted) });
      return;
    }

    const product = productFromBody(await readJson(req));
    const [updated] = await sql`
      update products set
        name = ${product.name},
        slug = ${product.slug},
        description = ${product.description},
        price_cents = ${product.priceCents},
        original_price_cents = ${product.originalPriceCents},
        image_url = ${product.image},
        is_new = ${product.isNew},
        is_active = ${product.isActive},
        updated_at = now()
      where id = ${id}
      returning *
    `;

    if (!updated) {
      sendJson(res, 404, { error: 'Product not found' });
      return;
    }

    sendJson(res, 200, { product: mapProduct(updated) });
  } catch (error) {
    handleApiError(res, error);
  }
}
