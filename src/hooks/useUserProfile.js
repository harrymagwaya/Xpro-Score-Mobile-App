import { getProfile } from '../api/tenant';
import useAuth from './useAuth';
import { useAsyncResource } from './useAsyncResource';

export default function useUserProfile() {
  const { token } = useAuth();
  const ready = Boolean(token);

  return useAsyncResource(() => getProfile(token), [token], {
    immediate: ready,
    enabled: ready
  });
}
