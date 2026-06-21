import { updateUser } from '../api/tenant';
import useAuth from './useAuth';

export function useUserActions() {
  const { token, userId } = useAuth();

  return {
    updateUser: (id, payload) => updateUser(token, id || userId, payload)
  };
}
