import { getScore } from '../api/tenant';
import useAuth from './useAuth';
import { useAsyncResource } from './useAsyncResource';

export function useLatestScore(tenantId) {
  const { token } = useAuth();
  const ready = Boolean(token && tenantId);

  return useAsyncResource(() => getScore(token, tenantId), [token, tenantId], {
    immediate: ready,
    enabled: ready
  });
}
