import { createRemoteJWKSet, jwtVerify } from 'jose';
import { getSql } from './db.js';
import { ApiError, forbidden, unauthorized } from './errors.js';

// JWKS sets are keyed by URL and cached across requests within an isolate.
// The remote set itself handles key rotation/caching internally.
const jwksCache = new Map();

const getJwks = (env) => {
  const jwksUrl = env.NEON_AUTH_JWKS_URL;
  if (!jwksUrl) {
    throw new Error('NEON_AUTH_JWKS_URL is required to verify Neon Auth tokens.');
  }

  let jwks = jwksCache.get(jwksUrl);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(jwksUrl));
    jwksCache.set(jwksUrl, jwks);
  }
  return jwks;
};

const extractBearerToken = (req) => {
  const header = req.header('authorization') || '';
  const [scheme, token] = header.split(' ');
  return scheme?.toLowerCase() === 'bearer' ? token : null;
};

const readUserFromPayload = (payload) => {
  const id = payload.sub;
  const email = payload.email || payload.user_email || payload.preferred_username;

  if (!id || !email) {
    throw new ApiError('Auth token is missing required user identity claims.', 401);
  }

  return { id, email: String(email).toLowerCase() };
};

export const getUserFromRequest = async (c) => {
  const token = extractBearerToken(c.req);
  if (!token) {
    throw unauthorized();
  }

  const env = c.env;
  const { payload } = await jwtVerify(token, getJwks(env), {
    issuer: env.NEON_AUTH_ISSUER || undefined,
    audience: env.NEON_AUTH_AUDIENCE || undefined,
  });

  return readUserFromPayload(payload);
};

export const ensureProfile = async (c, user) => {
  const sql = getSql(c.env);
  const adminEmail = c.env.ADMIN_EMAIL?.toLowerCase();
  const role = adminEmail && user.email === adminEmail ? 'admin' : 'customer';

  const [profile] = await sql`
    insert into profiles (id, email, role)
    values (${user.id}, ${user.email}, ${role})
    on conflict (id) do update set
      email = excluded.email,
      role = case
        when profiles.role = 'admin' then 'admin'
        when excluded.role = 'admin' then 'admin'
        else profiles.role
      end,
      updated_at = now()
    returning id, email, role
  `;

  return profile;
};

export const requireUser = async (c) => {
  const user = await getUserFromRequest(c);
  const profile = await ensureProfile(c, user);
  return { user, profile };
};

export const requireAdmin = async (c) => {
  const auth = await requireUser(c);
  if (auth.profile.role !== 'admin') {
    throw forbidden('Admin access required.');
  }
  return auth;
};
