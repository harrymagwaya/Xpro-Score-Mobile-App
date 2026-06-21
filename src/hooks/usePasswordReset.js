import { requestPasswordReset } from '../api/auth';

export function usePasswordResetActions() {
  return {
    requestPasswordReset
  };
}
