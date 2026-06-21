import { createFinancialRecord, getFinancialHistory } from '../api/tenant';
import useAuth from './useAuth';
import { useAsyncResource } from './useAsyncResource';

export function useTenantFinancialHistory(tenantId) {
  const { token } = useAuth();
  const ready = Boolean(token && tenantId);

  return useAsyncResource(() => getFinancialHistory(token, tenantId), [token, tenantId], {
    immediate: ready,
    enabled: ready
  });
}

export function useFinancialRecordActions() {
  const { token, userId } = useAuth();

  return {
    createFinancialRecord: (payload) => createFinancialRecord(token, { ...payload, tenantId: payload?.tenantId || userId })
  };
}
