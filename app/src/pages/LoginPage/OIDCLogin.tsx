import React from 'react';
import { TenantSelector } from 'components/TenantSelector/TenantSelector';
import { useEnv, useUpdateEnv } from 'hooks/env';
import {
  AuthProviders,
  Cluster,
  Clusters,
} from 'components/TenantSelector/types';
import { useHistory } from 'react-router-dom';
import _ from 'lodash';

import { stringify } from 'query-string';

const clusters: Clusters = [
  {
    label: 'Multi customer environments',
    options: [
      { value: '0', cluster: '', label: 'Europe 1 (Google)', legacyAuth: true },
      { value: '1', cluster: 'westeurope-1', label: 'Europe 2 (Microsoft)' },
      {
        value: '2',
        cluster: 'asia-northeast1-1',
        label: 'Asia 1',
        legacyAuth: true,
      },
      { value: '3', cluster: 'az-eastus-1', label: 'US East 1' },
    ],
  },
  {
    label: 'Single customer environments',
    options: [
      { value: '5', cluster: 'bp-northeurope', label: 'BP North Europe' },
      { value: '6', cluster: 'bp', label: 'BP', legacyAuth: true },
      { value: '7', cluster: 'az-energinet-westeurope', label: 'Energinet' },
      {
        value: '4',
        cluster: 'westeurope-1',
        label: 'Aize (Test)',
        type: AuthProviders.Auth0,
        configurationUrl:
          'https://test.login.aize.io/.well-known/openid-configuration',
        clientId: 'KthrD6rOXkrcGhsy4D1txOHzrYstaa77',
      },
      {
        value: '18',
        cluster: 'westeurope-1',
        label: 'Aize (QA)',
        type: AuthProviders.Auth0,
        configurationUrl:
          'https://qa.login.aize.io/.well-known/openid-configuration',
        clientId: 'Lw3aXjBwkGhYuIQuxxZrzbNt1mv1yYdO',
      },
      {
        value: '19',
        cluster: 'westeurope-1',
        label: 'Aize (Production)',
        type: AuthProviders.Auth0,
        configurationUrl:
          'https://login.aize.io/.well-known/openid-configuration',
        clientId: 'eHHthdNul8lJef0QqibC6xSiQ3iS7rF9',
      },
      { value: '8', cluster: 'omv', label: 'OMV', legacyAuth: true },
      { value: '9', cluster: 'pgs', label: 'PGS', legacyAuth: true },
      { value: '10', cluster: 'power-no', label: 'Power NO', legacyAuth: true },
      { value: '11', cluster: 'statnett', label: 'Statnett', legacyAuth: true },
    ],
  },
  {
    label: 'Staging environments',
    options: [
      { value: '12', cluster: 'azure-dev', label: 'azure-dev' },
      { value: '13', cluster: 'bluefield', label: 'bluefield' },
      {
        value: '14',
        cluster: 'cognitedata-development',
        label: 'cognitedata-development',
        legacyAuth: true,
      },
      {
        value: '15',
        cluster: 'greenfield',
        label: 'greenfield',
        legacyAuth: true,
      },
      { value: '16', cluster: 'openfield', label: 'openfield' },
      { value: '17', cluster: 'sandfield', label: 'sandfield' },
    ],
  },
];

export const OIDCLogin = () => {
  const setEnvironment = useUpdateEnv();
  const env = useEnv();
  const selectedClusterValue = _.isString(env) ? env : (env as Cluster).value;
  const cluster = _.isString(env) ? env : (env as Cluster).cluster;
  const history = useHistory();

  return (
    <TenantSelector
      getCluster={() => selectedClusterValue}
      clusters={clusters}
      updateCluster={(e) => setEnvironment(e)}
      move={(project, method = 'oauth') => {
        history.push(
          `/${project}?${stringify({
            ...(cluster && { cluster }),
            method,
          })}`
        );
      }}
    />
  );
};
