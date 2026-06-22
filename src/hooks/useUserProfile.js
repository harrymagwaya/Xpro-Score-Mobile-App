import { getProfile } from '../api/tenant';
import useAuth from './useAuth';
import { useAsyncResource } from './useAsyncResource';

export default function useUserProfile() {
  const { token, userId } = useAuth();
  const ready = Boolean(token && userId);

  return useAsyncResource(() => getProfile(token, userId), [token, userId], {
    immediate: ready,
    enabled: ready
  });
}
