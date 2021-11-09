import jwtDecode from 'jwt-decode';

export const checkUrl = (env: string) => window.location.hostname.includes(env);
export const isDevelopment = () => checkUrl('dev') || checkUrl('localhost');
export const isStaging = () => checkUrl('staging') || checkUrl('pr');
export const isProduction = () => !(isStaging() || isDevelopment());

export const extractTenants = (token: string) => {
  const tokenData: any = jwtDecode(token);
  return tokenData['https://twindata.io/tenants'];
};
export const createAuth0TenantUrl = (id: string) =>
  `https://twindata.io/cdf/${id}`;
