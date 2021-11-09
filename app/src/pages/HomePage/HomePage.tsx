import React from 'react';
import { useStoreState } from 'hooks';

export const HomePage = () => {
  const token = useStoreState((state) => state.auth.token);
  const project = useStoreState((state) => state.auth.tenant);
  const cluster = useStoreState((state) => state.auth.cluster);

  if (token) {
    const url = encodeURI(
      `http://localhost:8000/lab/index.html?token=${token}&project=${project}&cluster=${cluster}`
    );
    return (
      <iframe
        style={{ width: '100%', height: '100%' }}
        title="JupyterLite"
        src={url}
      />
    );
  }
  return <></>;
};
