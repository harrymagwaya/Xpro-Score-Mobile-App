export const linking = {
  prefixes: ['mobrental://', 'https://tenant.xpro.example/app'],
  config: {
    screens: {
      Login: 'user/login',
      Register: 'user/register',
      ResetPassword: 'user/reset-password',
      TenantTabs: {
        screens: {
          Home: 'home',
          Payments: 'payments',
          Unit: 'unit',
          Profile: 'profile'
        }
      }
    }
  }
};
