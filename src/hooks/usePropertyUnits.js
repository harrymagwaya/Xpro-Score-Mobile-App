import { getUnit } from '../api/tenant';
import useAuth from './useAuth';
import { useAsyncResource } from './useAsyncResource';

export function useUnitByTenant(tenantId) {
  const { token } = useAuth();
  const ready = Boolean(token && tenantId);

  return useAsyncResource(() => getUnit(token, tenantId), [token, tenantId], {
    immediate: ready,
    enabled: ready
  });
}
