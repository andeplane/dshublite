import { useLocation } from 'react-router-dom';

export const useQuery = {
  Tab: () => {
    const urlSearchParams = new URLSearchParams(useLocation().search);
    return urlSearchParams.get('tab') as string;
  },
  Schema: () => {
    const urlSearchParams = new URLSearchParams(useLocation().search);
    return urlSearchParams.get('schema') as string;
  },
  SchemaId: () => {
    const urlSearchParams = new URLSearchParams(useLocation().search);
    return urlSearchParams.get('schemaId') as string;
  },
  Method: () => {
    const urlSearchParams = new URLSearchParams(useLocation().search);
    const method = urlSearchParams.get('method');
    if (method === 'apikey' || method === 'tenant' || method === 'oauth') {
      return method;
    }
    return undefined;
  },
};
