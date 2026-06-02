import { requireUser, handleApiError } from './_lib/auth.js';
import { assertMethod, sendJson } from './_lib/http.js';

export default async function handler(req, res) {
  if (!assertMethod(req, res, ['GET'])) return;

  try {
    const { user, profile } = await requireUser(req);

    sendJson(res, 200, {
      user: {
        id: user.id,
        email: user.email,
        role: profile.role,
      },
    });
  } catch (error) {
    handleApiError(res, error);
  }
}
