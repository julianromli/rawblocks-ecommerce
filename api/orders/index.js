import { requireUser, handleApiError } from '../_lib/auth.js';
import { sql } from '../_lib/db.js';
import { assertMethod, readJson, sendJson } from '../_lib/http.js';

const SHIPPING_CENTS = 1500;

const readOrders = async (userId) => {
  const orders = await sql`
    select *
    from orders
    where user_id = ${userId}
    order by created_at desc
  `;

  if (orders.length === 0) {
    return [];
  }

  const orderIds = orders.map((order) => order.id);
  const items = await sql`
    select *
    from order_items
    where order_id = any(${orderIds})
    order by created_at asc
  `;

  return orders.map((order) => ({
    id: order.id,
    status: order.status,
    email: order.email,
    subtotal: order.subtotal_cents / 100,
    shipping: order.shipping_cents / 100,
    total: order.total_cents / 100,
    shippingDetails: order.shipping_details,
    createdAt: order.created_at,
    items: items
      .filter((item) => item.order_id === order.id)
      .map((item) => ({
        id: item.id,
        productId: item.product_id,
        name: item.product_name,
        price: item.price_cents / 100,
        quantity: item.quantity,
      })),
  }));
};

const validateShipping = (body, fallbackEmail) => {
  const shippingDetails = {
    email: String(body.email || fallbackEmail || '').trim(),
    firstName: String(body.firstName || '').trim(),
    lastName: String(body.lastName || '').trim(),
    address: String(body.address || '').trim(),
    city: String(body.city || '').trim(),
    postalCode: String(body.postalCode || '').trim(),
    newsletter: Boolean(body.newsletter),
  };

  const missing = ['email', 'firstName', 'lastName', 'address', 'city', 'postalCode'].filter(
    (key) => !shippingDetails[key],
  );

  if (missing.length > 0) {
    const error = new Error(`Missing checkout fields: ${missing.join(', ')}`);
    error.status = 400;
    throw error;
  }

  return shippingDetails;
};

export default async function handler(req, res) {
  if (!assertMethod(req, res, ['GET', 'POST'])) return;

  try {
    const { user } = await requireUser(req);

    if (req.method === 'GET') {
      sendJson(res, 200, { orders: await readOrders(user.id) });
      return;
    }

    const shippingDetails = validateShipping(await readJson(req), user.email);
    const [order] = await sql`
      with cart_snapshot as (
        select ci.product_id, ci.quantity, p.name, p.price_cents
        from cart_items ci
        join products p on p.id = ci.product_id
        where ci.user_id = ${user.id}
        order by ci.created_at asc
        for update
      ),
      totals as (
        select coalesce(sum(price_cents * quantity), 0)::integer as subtotal_cents
        from cart_snapshot
      ),
      created_order as (
        insert into orders (user_id, email, subtotal_cents, shipping_cents, total_cents, shipping_details)
        select
          ${user.id},
          ${shippingDetails.email},
          totals.subtotal_cents,
          case when totals.subtotal_cents > 0 then ${SHIPPING_CENTS} else 0 end,
          totals.subtotal_cents + case when totals.subtotal_cents > 0 then ${SHIPPING_CENTS} else 0 end,
          cast(${JSON.stringify(shippingDetails)} as jsonb)
        from totals
        where totals.subtotal_cents > 0
        returning *
      ),
      created_items as (
        insert into order_items (order_id, product_id, product_name, price_cents, quantity)
        select created_order.id, cart_snapshot.product_id, cart_snapshot.name, cart_snapshot.price_cents, cart_snapshot.quantity
        from created_order
        cross join cart_snapshot
        returning id
      ),
      cleared_cart as (
        delete from cart_items
        where user_id = ${user.id}
        and exists (select 1 from created_order)
      )
      select * from created_order
    `;

    if (!order) {
      sendJson(res, 400, { error: 'Cart is empty' });
      return;
    }

    sendJson(res, 201, {
      order: {
        id: order.id,
        status: order.status,
        total: order.total_cents / 100,
        createdAt: order.created_at,
      },
    });
  } catch (error) {
    handleApiError(res, error);
  }
}
