import { getCapacity } from '../api/tenant';
import useAuth from './useAuth';
import { useAsyncResource } from './useAsyncResource';

export function useTenantCapacity(tenantId) {
  const { token } = useAuth();
  const ready = Boolean(token && tenantId);

  return useAsyncResource(() => getCapacity(token, tenantId), [token, tenantId], {
    immediate: ready,
    enabled: ready
  });
}
