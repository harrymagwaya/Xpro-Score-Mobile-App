import { API_BASE_URL, TENANT_APP_ID } from '../config/env';

async function request(path, { token, method = 'GET', body, headers = {}, timeout = 12000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-APP': TENANT_APP_ID,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.message || 'Request failed.');
    }

    return data;
  } finally {
    clearTimeout(timer);
  }
}

export default request;
