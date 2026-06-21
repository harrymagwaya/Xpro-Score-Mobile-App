# Mobile Architecture

## Decision

Tenant lives as a separate mobile build.

## Reasons

- Stronger app branding and app-store identity
- Safer auth isolation from landlord/admin portals
- Better control over offline behavior and mobile UX
- Cleaner deep linking and notification routing
- Easier future native integrations

## Hardening choices

- Force `XPRO_RENTAL_MOBILE_APP` on sign-in
- Reject non-tenant roles after login response
- Persist session locally and expire it client-side
- Surface network status globally
- Use retryable fetch utilities with consistent error parsing

## Still expected before production release

- Replace placeholder icon/splash assets
- Add biometric or device passcode re-entry if required
- Wire reset-password endpoint to the final backend contract
- Add analytics, crash reporting, and push notifications
- Add EAS build configuration if publishing with Expo
