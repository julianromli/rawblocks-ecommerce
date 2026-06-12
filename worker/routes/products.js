import { Hono } from 'hono';
import { requireAdmin } from '../lib/auth.js';
import { getSql, mapProduct } from '../lib/db.js';
import { badRequest, notFound, toErrorResponse } from '../lib/errors.js';

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
    throw badRequest('Product name, description, image, and valid price are required.');
  }

  if (originalPrice !== null && (!Number.isFinite(originalPrice) || originalPrice < price)) {
    throw badRequest('Original price must be greater than or equal to price.');
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

const products = new Hono();

products.get('/', async (c) => {
  try {
    const sql = getSql(c.env);
    const includeInactive = c.req.query('includeInactive') === 'true';

    if (includeInactive) {
      await requireAdmin(c);
    }

    const rows = includeInactive
      ? await sql`select * from products order by created_at desc`
      : await sql`select * from products where is_active = true order by created_at desc`;

    return c.json({ products: rows.map(mapProduct) });
  } catch (error) {
    return toErrorResponse(c, error);
  }
});

products.post('/', async (c) => {
  try {
    await requireAdmin(c);
    const sql = getSql(c.env);
    const product = productFromBody(await c.req.json());
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

    return c.json({ product: mapProduct(created) }, 201);
  } catch (error) {
    return toErrorResponse(c, error);
  }
});

const updateProductFromBody = (body) => {
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
    throw badRequest('Product name, slug, description, image, and valid price are required.');
  }

  if (originalPrice !== null && (!Number.isFinite(originalPrice) || originalPrice < price)) {
    throw badRequest('Original price must be greater than or equal to price.');
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

products.delete('/:id', async (c) => {
  try {
    await requireAdmin(c);
    const sql = getSql(c.env);
    const id = c.req.param('id');

    const [deleted] = await sql`delete from products where id = ${id} returning *`;
    if (!deleted) {
      throw notFound('Product not found');
    }

    return c.json({ product: mapProduct(deleted) });
  } catch (error) {
    return toErrorResponse(c, error);
  }
});

products.patch('/:id', async (c) => {
  try {
    await requireAdmin(c);
    const sql = getSql(c.env);
    const id = c.req.param('id');
    const product = updateProductFromBody(await c.req.json());

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
      throw notFound('Product not found');
    }

    return c.json({ product: mapProduct(updated) });
  } catch (error) {
    return toErrorResponse(c, error);
  }
});

export default products;
