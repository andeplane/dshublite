import axios from 'axios';
import { isProduction } from './utils';

export const getBaseURL = (cluster?: string) => {
  const clusterName = cluster && cluster !== 'api' ? `${cluster}.` : '';

  if (!isProduction()) {
    return `https://apps-api.staging.${clusterName}cognite.ai`;
  }

  return `https://apps-api.${clusterName}cognite.ai`;
};

const api = axios.create({});

export const validateTenant = async (tenant: string, cluster?: string) => {
  const requestParams = {
    params: {
      app: 'cdf',
      tenant,
      redirectUrl: window.location.origin,
    },
  };
  const response = await api.get<boolean>(
    `${getBaseURL(cluster)}/tenant`,
    requestParams
  );
  return response.data;
};
