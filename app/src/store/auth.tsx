import { action, Action } from 'easy-peasy';
import mixpanel from 'utils/mixpanel-frontend';
import { useStoreActions } from 'hooks';
import { useResetSdk } from 'store/sdk';
import JWT from 'jwt-decode';
import { CogniteClient } from '@cognite/sdk';
import { getFlow } from '@cognite/auth-utils';
import {
  AuthProviders,
  ClientInfo,
  Cluster,
} from 'components/TenantSelector/types';
import _ from 'lodash';
import { useEnv } from '../hooks/env';

export enum LoginType {
  apikey,
  oauth,
  tenant,
}

/**
 * This is from https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/Overview/appId/86057cba-4df2-4613-a27d-e747e17a5305/isMSAApp/. The configs are in Terraform.
 */
const AZURE_APP_ID = '86057cba-4df2-4613-a27d-e747e17a5305';

export const getClientId = (clientId: string | undefined) =>
  clientId || AZURE_APP_ID;

export interface AuthModel {
  apiKey: string | undefined;
  tenant: string | undefined;
  token: string | undefined;
  cluster: string | undefined;
  email: string | undefined;
  loggedIn: boolean | undefined;
  // methods
  setLoggedIn: Action<
    AuthModel,
    | {
        apiKey?: string;
        tenant?: string;
        email?: string;
        cluster?: string;
        loginType: LoginType;
      }
    | false
  >;
  updateToken: Action<AuthModel, string | undefined>;
}

export const API_KEY_LOCALSTORAGE_KEY = '__itg__api_key';
export const TENANT_LOCALSTORAGE_KEY = '__itg__tenant';
export const CLUSTER_LOCALSTORAGE_KEY = '__itg__cluster';

export const authModel: AuthModel = {
  apiKey: localStorage.getItem(API_KEY_LOCALSTORAGE_KEY) || undefined,
  tenant: localStorage.getItem(TENANT_LOCALSTORAGE_KEY) || undefined,
  cluster: undefined,
  email: undefined,
  token: undefined,
  loggedIn: undefined,
  // methods
  setLoggedIn: action((state, params) => {
    if (!params) {
      state.apiKey = undefined;
      state.token = undefined;
      state.tenant = undefined;
      state.cluster = undefined;
      state.email = undefined;
      state.loggedIn = undefined;
    } else {
      const { apiKey, tenant, cluster, loginType, email } = params;
      if (tenant && tenant.length !== 0) {
        localStorage.setItem(TENANT_LOCALSTORAGE_KEY, tenant);
        state.tenant = tenant;
      }
      if (apiKey && apiKey.length !== 0) {
        localStorage.setItem(API_KEY_LOCALSTORAGE_KEY, apiKey);
        state.apiKey = apiKey;
        state.token = apiKey;
      }
      if (cluster && cluster.length !== 0) {
        localStorage.setItem(CLUSTER_LOCALSTORAGE_KEY, cluster);
        state.cluster = cluster;
      }
      if (email && email.length !== 0) {
        state.email = email.toLowerCase();
      }
      if (loginType.toString()) {
        state.loggedIn = true;
      }
    }
  }),
  updateToken: action((state, token) => {
    state.token = token;
    if (!state.tenant)
      // solving temp gql 500 error for requests with token but without project in header
      state.tenant = localStorage.getItem(TENANT_LOCALSTORAGE_KEY) || undefined;
  }),
};

const getCluster = (env: string | Cluster) =>
  _.isString(env) ? env : (env as Cluster).cluster;

export const generateLoginOptions = (
  client: ClientInfo,
  options: any,
  prompt: string
): any => {
  const audience = { audience: options?.directory || '' };
  return client.provider === AuthProviders.Azure
    ? {
        type: 'AAD_OAUTH',
        options: {
          clientId: client.id,
          cluster: client.cluster || 'api',
          tenantId: options?.directory,
          signInType: {
            type: 'loginRedirect',
            requestParams: {
              prompt,
            },
          },
        },
      }
    : {
        type: 'OIDC_AUTHORIZATION_CODE_FLOW',
        options: {
          clientId: client.id,
          cluster: client.cluster || 'api',
          openIdConfigurationUrl: client.configurationUrl,
          responseMode: 'query',
          responseType: 'code',
          extraScope: 'openid profile offline_access',
          authenticateParams: audience,
          refreshParams: audience,
          loginParams: {
            prompt,
          },
        },
      };
};

export const useLogin = () => {
  const setLoggedIn = useStoreActions((state) => state.auth.setLoggedIn);
  const env = useEnv();
  const updateToken = useStoreActions((state) => state.auth.updateToken);
  const cluster = getCluster(env);
  const provider =
    _.isString(env) || (env as Cluster).type !== AuthProviders.Auth0
      ? AuthProviders.Azure
      : AuthProviders.Auth0;
  const resetSdk = useResetSdk();
  const sdk = new CogniteClient({ appId: 'il-tempo-gigante' });
  const clientId = getClientId(
    _.isString(env) ? undefined : (env as Cluster).clientId
  );
  const postOAuthLogin = usePostOAuthLogin();
  return async ({
    apiKey,
    tenant,
    token,
    useOIDC,
  }: {
    apiKey?: string;
    token?: string;
    tenant?: string;
    useOIDC?: boolean;
  }) => {
    resetSdk(sdk);
    const { flow, options } = getFlow(tenant, cluster);
    if (useOIDC) {
      if (flow && options && env && tenant) {
        const config: any = generateLoginOptions(
          {
            id: clientId,
            cluster,
            provider,
            configurationUrl: (env as Cluster).configurationUrl,
          },
          options,
          'none'
        );

        await sdk.loginWithOAuth(config);
        await sdk.authenticate();
        await sdk.setProject(tenant);
        const cdfToken = await sdk.getCDFToken();
        if (cdfToken) {
          postOAuthLogin(sdk, tenant);
          return { loggedIn: true };
        }
      }
      return { loggedIn: false };
    }
    if (apiKey) {
      await handleLoginForApiKey(sdk, apiKey);
    } else if (tenant) {
      if (token) {
        await verifyLoginForTenant(sdk, tenant, token, updateToken);
      } else {
        await handleLoginForTenant(sdk, tenant, updateToken);
      }
    }

    const response = await sdk.login.status();
    if (response) {
      const { user, project } = response;
      mixpanel.people.set_once({ $email: user, cdfTenant: project });
      mixpanel.identify(user);
      mixpanel.register({
        cdfTenant: project,
      });
      if (token) {
        updateToken(token);
      }
      mixpanel.track('Logged in');
      setLoggedIn({
        tenant: project,
        email: user,
        apiKey,
        loginType: apiKey ? LoginType.apikey : LoginType.tenant,
      });
      return { loggedIn: true, tenant: project, user };
    }
    setLoggedIn(false);
    return { loggedIn: false };
  };
};
export const usePostOAuthLogin = () => {
  const setLoggedIn = useStoreActions((state) => state.auth.setLoggedIn);
  const updateToken = useStoreActions((state) => state.auth.updateToken);
  const env = useEnv();
  const cluster = getCluster(env);
  return async (sdk: CogniteClient, tenant?: string) => {
    let cdfToken: string | null = null;
    try {
      cdfToken = await sdk.getCDFToken();
    } catch {
      // noop, because cdfToken is completely internal to the SDK and there's no way to check if that is available without it throwing an error
      // in the case an error is thrown, we should safely assume the user is not logged in, and ignore the error
    }
    if (cdfToken) {
      updateToken(cdfToken);
      // unique name is usually supplied via AAD token to indicate the user's unique identifier if email is missing
      // eslint-disable-next-line camelcase
      const response = JWT<Record<string, string>>(cdfToken);
      const email =
        response.email ||
        response.unique_name ||
        response['https://twindata.io/email'];

      setLoggedIn({
        tenant,
        email,
        loginType: LoginType.oauth,
        cluster: cluster || 'api',
      });
      mixpanel.people.set_once({
        $email: email,
        cdfTenant: tenant,
      });
      mixpanel.identify(email);
      mixpanel.register({
        cdfTenant: tenant,
      });
    }
  };
};

const handleLoginForApiKey = async (
  cdfClient: CogniteClient,
  apiKey: string
) => {
  const loginData = await fetch('https://api.cognitedata.com/login/status', {
    headers: {
      'api-key': apiKey,
    },
  });
  const asJson = await loginData.json();
  const { project, loggedIn } = asJson.data;
  if (loggedIn !== true) {
    throw new Error('Could not log in');
  }
  cdfClient.loginWithApiKey({
    project,
    apiKey,
  });
};

const handleLoginForTenant = async (
  cdfClient: CogniteClient,
  tenant: string,
  onToken: (newToken: string | undefined) => void
) => {
  localStorage.setItem(TENANT_LOCALSTORAGE_KEY, tenant);
  await cdfClient.loginWithOAuth({
    type: 'CDF_OAUTH',
    options: {
      project: tenant,
      onAuthenticate: 'REDIRECT',
      onTokens: onTenantToken(cdfClient, onToken),
    },
  });
  await cdfClient.authenticate();
};

const verifyLoginForTenant = async (
  cdfClient: CogniteClient,
  tenant: string,
  token: string,
  onToken: (newToken: string | undefined) => void
) => {
  localStorage.setItem(TENANT_LOCALSTORAGE_KEY, tenant);
  await cdfClient.loginWithOAuth({
    type: 'CDF_OAUTH',
    options: {
      project: tenant,
      accessToken: token,
      onAuthenticate: 'REDIRECT',
      onTokens: onTenantToken(cdfClient, onToken),
    },
  });
};

const onTenantToken =
  (cdfClient: CogniteClient, onToken: (newToken: string | undefined) => void) =>
  async ({
    accessToken,
    idToken,
  }: {
    accessToken: string;
    idToken: string;
  }) => {
    const loginStatus = await cdfClient.login.status();
    if (loginStatus) {
      onToken(accessToken);

      const response = JWT<{ exp: number }>(idToken);

      setTimeout(() => {
        cdfClient.authenticate();
      }, response.exp * 1000 - new Date().getTime());
    } else {
      mixpanel.track('Unable to refetch token');
    }
  };
