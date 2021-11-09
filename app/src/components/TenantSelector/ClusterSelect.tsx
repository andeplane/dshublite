import { Title } from '@cognite/cogs.js';
import React from 'react';
import CreatableSelect from 'react-select/creatable';
import { Cluster } from './types';

type Props = {
  cluster: string;
  onClusterChange: (e: Cluster) => void;
  clusters: {
    label: string;
    options: Cluster[];
  }[];
};

/**
 * Taken from https://github.com/cognitedata/cdf-hub-tenant-selector
 */
export default function ClusterSelect({
  cluster,
  onClusterChange,
  clusters,
}: Props) {
  const value = clusters
    .reduce((accl: Cluster[], group) => [...accl, ...group.options], [])
    .find((e) => e.value === cluster) || {
    value: cluster,
    label: cluster,
  };

  return (
    <>
      <Title level={5} style={{ marginBottom: 4 }}>
        Cluster
      </Title>
      <CreatableSelect
        // @ts-ignore
        value={value}
        onChange={(e) => {
          // @ts-ignore
          onClusterChange(e);
        }}
        formatCreateLabel={(e) => `Use: ${e}`}
        options={clusters}
      />
    </>
  );
}
