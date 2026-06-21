import { getRentalProfile } from '../api/tenant';
import useAuth from './useAuth';
import { useAsyncResource } from './useAsyncResource';

export function useRentalProfilesByTenant(tenantId) {
  const { token } = useAuth();
  const ready = Boolean(token && tenantId);

  return useAsyncResource(() => getRentalProfile(token, tenantId), [token, tenantId], {
    immediate: ready,
    enabled: ready
  });
}
