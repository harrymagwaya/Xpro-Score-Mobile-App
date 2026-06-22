import { updateTenantProfile } from '../api/tenant';
import useAuth from './useAuth';

export function useUserActions() {
  const { token, userId } = useAuth();

  return {
    updateUser: (id, payload) => updateTenantProfile(token, id || userId, payload)
  };
}
