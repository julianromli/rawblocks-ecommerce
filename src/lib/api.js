let accessTokenProvider = null;

export const setAccessTokenProvider = (provider) => {
  accessTokenProvider = provider;
};

export const apiRequest = async (path, options = {}) => {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.auth !== false) {
    const token = await accessTokenProvider?.();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(path, {
    ...options,
    headers,
    body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(payload.error || 'Request failed');
  }

  return payload;
};

// Upload a file via multipart/form-data. Keeps the same auth/token handling as
// apiRequest but lets the browser set the multipart Content-Type boundary.
export const uploadFile = async (path, file, options = {}) => {
  const headers = new Headers(options.headers);

  if (options.auth !== false) {
    const token = await accessTokenProvider?.();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(path, { method: 'POST', headers, body: formData });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(payload.error || 'Upload failed');
  }

  return payload;
};
