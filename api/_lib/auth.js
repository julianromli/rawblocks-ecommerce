import { createRemoteJWKSet, jwtVerify } from 'jose';
import { sql } from './db.js';
import { sendJson } from './http.js';

const jwksUrl = process.env.NEON_AUTH_JWKS_URL;
const issuer = process.env.NEON_AUTH_ISSUER || undefined;
const audience = process.env.NEON_AUTH_AUDIENCE || undefined;
const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();

let jwks;

const getJwks = () => {
  if (!jwksUrl) {
    throw new Error('NEON_AUTH_JWKS_URL is required to verify Neon Auth tokens.');
  }

  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(jwksUrl));
  }

  return jwks;
};

const extractBearerToken = (req) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  return scheme?.toLowerCase() === 'bearer' ? token : null;
};

const readUserFromPayload = (payload) => {
  const id = payload.sub;
  const email = payload.email || payload.user_email || payload.preferred_username;

  if (!id || !email) {
    throw new Error('Auth token is missing required user identity claims.');
  }

  return {
    id,
    email: String(email).toLowerCase(),
  };
};

export const getUserFromRequest = async (req) => {
  const token = extractBearerToken(req);
  if (!token) {
    const error = new Error('Authentication required.');
    error.status = 401;
    throw error;
  }

  const { payload } = await jwtVerify(token, getJwks(), {
    issuer,
    audience,
  });

  return readUserFromPayload(payload);
};

export const ensureProfile = async (user) => {
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

export const requireUser = async (req) => {
  const user = await getUserFromRequest(req);
  const profile = await ensureProfile(user);
  return { user, profile };
};

export const requireAdmin = async (req) => {
  const auth = await requireUser(req);

  if (auth.profile.role !== 'admin') {
    const error = new Error('Admin access required.');
    error.status = 403;
    throw error;
  }

  return auth;
};

export const handleApiError = (res, error) => {
  const status = error.status || 500;
  const message = status === 500 ? 'Internal server error' : error.message;

  if (status === 500) {
    console.error(error);
  }

  sendJson(res, status, { error: message });
};
