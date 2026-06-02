import { requireUser, handleApiError } from '../_lib/auth.js';
import { mapCartItem, sql } from '../_lib/db.js';
import { assertMethod, parsePositiveInteger, readJson, sendJson } from '../_lib/http.js';

const readCart = async (userId) => {
  const items = await sql`
    select
      p.id,
      p.name,
      p.slug,
      p.description,
      p.price_cents,
      p.original_price_cents,
      p.image_url,
      p.is_new,
      p.is_active,
      ci.quantity
    from cart_items ci
    join products p on p.id = ci.product_id
    where ci.user_id = ${userId}
    order by ci.created_at asc
  `;

  return items.map(mapCartItem);
};

export default async function handler(req, res) {
  if (!assertMethod(req, res, ['GET', 'PUT', 'PATCH', 'DELETE'])) return;

  try {
    const { user } = await requireUser(req);
    await sql`insert into carts (user_id) values (${user.id}) on conflict (user_id) do nothing`;

    if (req.method === 'PUT') {
      const body = await readJson(req);
      const productId = String(body.productId || '');
      const quantity = parsePositiveInteger(body.quantity);

      const [product] = await sql`select id from products where id = ${productId} and is_active = true`;
      if (!product) {
        sendJson(res, 404, { error: 'Product not found' });
        return;
      }

      await sql`
        insert into cart_items (user_id, product_id, quantity)
        values (${user.id}, ${productId}, ${quantity})
        on conflict (user_id, product_id) do update set
          quantity = excluded.quantity,
          updated_at = now()
      `;
      await sql`update carts set updated_at = now() where user_id = ${user.id}`;
    }

    if (req.method === 'PATCH') {
      const body = await readJson(req);
      const productId = String(body.productId || '');
      const delta = Number(body.delta);

      if (!Number.isInteger(delta) || delta === 0) {
        sendJson(res, 400, { error: 'A non-zero integer delta is required.' });
        return;
      }

      if (delta > 0) {
        const [product] = await sql`select id from products where id = ${productId} and is_active = true`;
        if (!product) {
          sendJson(res, 404, { error: 'Product not found' });
          return;
        }

        await sql`
          insert into cart_items (user_id, product_id, quantity)
          values (${user.id}, ${productId}, ${delta})
          on conflict (user_id, product_id) do update set
            quantity = cart_items.quantity + excluded.quantity,
            updated_at = now()
        `;
      } else {
        await sql`
          update cart_items
          set quantity = quantity + ${delta}, updated_at = now()
          where user_id = ${user.id} and product_id = ${productId}
        `;
        await sql`delete from cart_items where user_id = ${user.id} and product_id = ${productId} and quantity <= 0`;
      }

      await sql`update carts set updated_at = now() where user_id = ${user.id}`;
    }

    if (req.method === 'DELETE') {
      const productId = req.query.productId ? String(req.query.productId) : null;

      if (productId) {
        await sql`delete from cart_items where user_id = ${user.id} and product_id = ${productId}`;
      } else {
        await sql`delete from cart_items where user_id = ${user.id}`;
      }

      await sql`update carts set updated_at = now() where user_id = ${user.id}`;
    }

    sendJson(res, 200, { items: await readCart(user.id) });
  } catch (error) {
    handleApiError(res, error);
  }
}
