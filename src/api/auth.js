import request from './client';
import { LOGIN_ENDPOINT, PASSWORD_RESET_ENDPOINT, TENANT_APP_ID } from '../config/env';

const REGISTER_ENDPOINT = '/api/v1/users/register';

export async function loginTenant(email, password) {
  const data = await request(LOGIN_ENDPOINT, {
    method: 'POST',
    headers: { 'X-APP': TENANT_APP_ID },
    body: { email, password }
  });

  const role = data?.role;
  if (role !== 'TENANT') {
    throw new Error(`Your account type (${role || 'UNKNOWN'}) is not permitted to access ${TENANT_APP_ID}.`);
  }

  return {
    token: data?.token,
    userId: data?.userId,
    role,
    expiresIn: Number(data?.expiresIn),
    appType: data?.appType || TENANT_APP_ID
  };
}

export async function registerTenant(payload) {
  const data = await request(REGISTER_ENDPOINT, {
    method: 'POST',
    headers: { 'X-APP': TENANT_APP_ID },
    body: {
      ...payload,
      userRole: 'TENANT'
    }
  });

  const role = data?.role || data?.userRole;
  if (role && role !== 'TENANT') {
    throw new Error('Registration completed, but the created account was not a tenant account.');
  }

  return data;
}

export async function requestPasswordReset(email) {
  return request(PASSWORD_RESET_ENDPOINT, {
    method: 'POST',
    body: { email }
  });
}
