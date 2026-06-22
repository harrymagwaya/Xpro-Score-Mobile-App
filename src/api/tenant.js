import request from './client';
import { extractList } from '../utils/format';

export const endpoints = {
  profile: (userId) => `/api/v1/tenants/${userId}`,
  score: (tenantId) => `/api/v1/scoring/latest/${tenantId}`,
  eligibility: (tenantId) => `/api/v1/eligibility/tenant/${tenantId}/latest`,
  records: (tenantId) => `/api/v1/financial-records/tenant/${tenantId}`,
  unit: (tenantId) => `/api/v1/units/tenant/${tenantId}`,
  rentalProfile: (tenantId) => `/api/v1/rental-profiles/tenant/${tenantId}`,
  capacity: (tenantId) => `/api/v1/tenant-capacities/${tenantId}`,
  upsertCapacity: '/api/v1/tenant-capacities/upsert',
  createRecord: '/api/v1/financial-records',
  updateTenantProfile: (userId) => `/api/v1/tenants/${userId}`
};

export const getProfile = (token, userId) => request(endpoints.profile(userId), { token });
export const getScore = (token, tenantId) => request(endpoints.score(tenantId), { token });
export const getEligibility = (token, tenantId) => request(endpoints.eligibility(tenantId), { token });
export const getFinancialHistory = (token, tenantId) => request(endpoints.records(tenantId), { token });
export const getUnit = (token, tenantId) => request(endpoints.unit(tenantId), { token });
export const getRentalProfile = (token, tenantId) => request(endpoints.rentalProfile(tenantId), { token });
export const getCapacity = (token, tenantId) => request(endpoints.capacity(tenantId), { token });
export const upsertTenantCapacity = (token, payload) =>
  request(endpoints.upsertCapacity, { token, method: 'POST', body: payload });
export const createFinancialRecord = (token, payload) => request(endpoints.createRecord, { token, method: 'POST', body: payload });
export const updateTenantProfile = (token, userId, payload) =>
  request(endpoints.updateTenantProfile(userId), { token, method: 'PATCH', body: payload });

export async function getTenantDashboardBundle(token, tenantId) {
  const [profile, score, eligibility, history, unit, rentalProfile, capacity] = await Promise.all([
    getProfile(token, tenantId),
    getScore(token, tenantId),
    getEligibility(token, tenantId),
    getFinancialHistory(token, tenantId),
    getUnit(token, tenantId),
    getRentalProfile(token, tenantId),
    getCapacity(token, tenantId)
  ]);

  return {
    profile,
    score,
    eligibility,
    history: extractList(history),
    unit,
    rentalProfile,
    capacity
  };
}
