import { getEligibility } from '../api/tenant';
import useAuth from './useAuth';
import { useAsyncResource } from './useAsyncResource';

export function useEligibility(tenantId) {
  const { token } = useAuth();
  const ready = Boolean(token && tenantId);

  return useAsyncResource(() => getEligibility(token, tenantId), [token, tenantId], {
    immediate: ready,
    enabled: ready
  });
}

export function useEligibilityActions() {
  return {
    assessEligibility: async () => {
      throw new Error('Eligibility assessment action is not wired in the mobile app yet.');
    }
  };
}
