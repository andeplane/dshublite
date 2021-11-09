import { Cluster } from 'components/TenantSelector/types';
import queryString from 'query-string';
import { useHistory, useLocation } from 'react-router-dom';
import _ from 'lodash';

const ITG_ENV_PREF = 'itg_env_pref';

export function useEnv(): Cluster | string {
  const location = useLocation();
  const params = queryString.parse(location.search);
  let lsEnv = window.localStorage.getItem(ITG_ENV_PREF) || '';
  try {
    lsEnv = JSON.parse(lsEnv);
    // eslint-disable-next-line no-empty
  } catch {}

  const { env } = params;
  if (env instanceof Array) {
    return env[0] || '';
  }

  return lsEnv || env || '0';
}

export function useUpdateEnv() {
  const history = useHistory();
  const params = queryString.parse(history.location.search);
  return (env: Cluster | string | undefined) => {
    if (!env) {
      delete params.env;
    } else {
      params.env = _.isString(env) ? env : (env as Cluster).value;
    }
    if (env) {
      window.localStorage.setItem(ITG_ENV_PREF, JSON.stringify(env));
    } else {
      window.localStorage.removeItem(ITG_ENV_PREF);
    }
    history.push({
      search: queryString.stringify(params),
    });
  };
}
