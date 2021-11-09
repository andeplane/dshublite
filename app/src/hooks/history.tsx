import { useHistory } from 'react-router-dom';

export const useStatefulHistory = () => {
  const history = useHistory();

  return {
    ...history,
    pushStateful: (pathname: string) =>
      history.push({
        search: history.location.search,
        pathname,
      }),
    replaceStateful: (pathname: string) =>
      history.replace({
        search: history.location.search,
        pathname,
      }),
  };
};
