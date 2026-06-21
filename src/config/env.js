import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || extra.apiBaseUrl || 'http://localhost:8081';
export const LOGIN_ENDPOINT = process.env.EXPO_PUBLIC_LOGIN_ENDPOINT || extra.loginEndpoint || '/api/v1/auth/login';
export const PASSWORD_RESET_ENDPOINT = process.env.EXPO_PUBLIC_PASSWORD_RESET_ENDPOINT || extra.passwordResetEndpoint || '/api/v1/auth/reset-password';
export const TENANT_APP_ID = extra.tenantAppId || 'XPRO_RENTAL_MOBILE_APP';
