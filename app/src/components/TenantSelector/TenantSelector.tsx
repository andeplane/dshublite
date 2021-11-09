import React, { useEffect, useState } from 'react';

import { Icon } from '@cognite/cogs.js';
import { getFlow, saveFlow, saveTenantFlow } from '@cognite/auth-utils';
import styled from 'styled-components/macro';

import { useSdk, useResetSdk } from 'store/sdk';
import { CogniteClient } from '@cognite/sdk';
import {
  getClientId,
  usePostOAuthLogin,
  generateLoginOptions,
} from 'store/auth';
import _ from 'lodash';
import { AuthProviders, Cluster } from './types';

import LoginWithAzure from './LoginWithAzure';
import LegacyLoginInput from './LegacyLoginInput';
import ClusterSelect from './ClusterSelect';
import ProjectSelect from './ProjectSelect';
import TenantList from './TenantList';
import { createAuth0TenantUrl, extractTenants } from './utils';

type ClustersInfo = {
  label: string;
  options: Cluster[];
};

type Props = {
  getCluster: () => string;
  updateCluster: (cluster: Cluster) => void;
  clusters: ClustersInfo[];
  move: (project: string, method?: string, tenant?: string) => void;
};

const getClusterInfo = (cluster: string, clusters: Cluster[]) =>
  clusters.find((x) => x.value === cluster);

const accumulateClustersOptions = (clustersInfo: ClustersInfo[]) =>
  clustersInfo.reduce((acc: Cluster[], c) => [...acc, ...c.options], []);

// oidc client in sdk adds some items in localstorage, contain sensitive info
const clearOidcItems = () => {
  _.forIn(window.localStorage, (value: string, objKey: string) => {
    if (_.startsWith(objKey, 'oidc')) {
      window.localStorage.removeItem(objKey);
    }
  });
};

export const TenantSelector = ({
  getCluster,
  updateCluster,
  clusters,
  move,
}: Props) => {
  const sdk = useSdk();
  const resetSdk = useResetSdk();
  const postOAuthLogin = usePostOAuthLogin();

  const cluster = getCluster();
  const clustersOptions = accumulateClustersOptions(clusters);
  const selectedClusterInfo = getClusterInfo(cluster, clustersOptions);

  const [clientId, setClientId] = useState(
    getClientId(selectedClusterInfo?.clientId)
  );
  const [provider, setProvider] = useState<
    AuthProviders.Azure | AuthProviders.Auth0
  >(selectedClusterInfo?.type || AuthProviders.Azure);

  const onClusterChange = (e: Cluster) => {
    setClientId(getClientId(e?.clientId));

    setProvider(e?.type ?? AuthProviders.Azure);
    setCluster(e);
  };

  const setCluster = updateCluster;

  const [gotToken, setGotToken] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasError, setHasError] = useState(false);

  const clustersWithLegacyAuth = clustersOptions.filter((c) => c.legacyAuth);
  const clustersWithAAD = clustersOptions.filter((c) => !c.disableAad);

  const clientInfo = {
    id: clientId,
    provider,
    cluster: selectedClusterInfo?.cluster,
    configurationUrl: selectedClusterInfo?.configurationUrl,
  };

  const GetTenantToken = () => {
    const { options } = getFlow();
    const newSdk = new CogniteClient({
      appId: 'il-tempo-gigante',
    });
    resetSdk(newSdk);
    newSdk
      .loginWithOAuth(
        generateLoginOptions(clientInfo, options, 'select_account')
      )
      .then(async () => newSdk.authenticate());
  };

  const saveAzureFlow = (directory: string) =>
    saveFlow('AZURE_AD', {
      directory,
    });

  const onTenantChanged = (id: string) => {
    const { options } = getFlow();
    if (options?.directory.includes(id)) return;
    saveAzureFlow(createAuth0TenantUrl(id));
    GetTenantToken();
  };

  const setDefaultTenant = (token: string | null) => {
    if (!token) return;
    saveAzureFlow(createAuth0TenantUrl(extractTenants(token)[0].id));
  };

  const AUTH0_TWO_STEP_KEY = 'is_two_steps_login_required';

  useEffect(() => {
    const { flow, options } = getFlow();
    const needTwoStepLogin = localStorage.getItem(AUTH0_TWO_STEP_KEY);
    if (flow === 'AZURE_AD') {
      setIsInitializing(true);
      const newSdk = new CogniteClient({
        appId: 'il-tempo-gigante',
      });
      resetSdk(newSdk);

      newSdk
        .loginWithOAuth(generateLoginOptions(clientInfo, options, 'none'))
        .then(async (t) => {
          if (needTwoStepLogin) {
            localStorage.removeItem(AUTH0_TWO_STEP_KEY);
            setIsInitializing(true);
            if (!options?.directory) {
              setDefaultTenant(await newSdk.getIdToken());
            }
            await GetTenantToken();
          }
          setGotToken(t);
          setHasError(false);
          postOAuthLogin(sdk);
        })
        .catch(() => {
          setHasError(true);
        })
        .finally(() => {
          if (!needTwoStepLogin) setIsInitializing(false);
        });
    }
  }, [cluster, clientId]);

  return (
    <Card>
      <ContentWrapper>
        <ClusterSelect
          cluster={cluster}
          clusters={clusters}
          onClusterChange={(env) => {
            onClusterChange(env);
          }}
        />
        <>
          {gotToken && !!sdk && (
            <TenantList sdkv3={sdk} onTenantChanged={onTenantChanged} />
          )}
          {gotToken && !!sdk && <ProjectSelect sdkv3={sdk} move={move} />}

          {!isInitializing &&
          window?.sessionStorage?.getItem('login-clicked') === 'true' &&
          (hasError || !gotToken) ? (
            <>
              <div style={{ margin: '10px 0' }}>
                <Icon
                  type="ErrorStroked"
                  style={{ color: 'var(--cogs-danger)', marginRight: 10 }}
                />
                An error occurred when logging into the environment above. Make
                sure you are a user that belongs in an Azure tenant that has the
                cluster installed.
              </div>

              {clustersWithLegacyAuth.find((c) => c.value === cluster) && (
                <div style={{ margin: '10px 0' }}>
                  <strong>
                    It is still possible to specify the project name below.
                  </strong>{' '}
                  This error is not relevant for that sign in flow.
                </div>
              )}
            </>
          ) : null}
          {clustersWithAAD.map((c) => c.value).includes(cluster) && (
            <LoginWithAzure
              login={(directory?: string) => {
                const { options } = getFlow();
                setIsInitializing(true);
                setHasError(false);

                window.localStorage.removeItem('@cognite/sdk:accountLocalId');
                window.sessionStorage.setItem('login-clicked', 'true');

                const newSdk = new CogniteClient({
                  appId: 'il-tempo-gigante',
                });
                resetSdk(newSdk);
                newSdk
                  .loginWithOAuth(
                    generateLoginOptions(clientInfo, options, 'select_account')
                  )
                  .then(() => {
                    saveAzureFlow(directory || '');
                    return newSdk.authenticate();
                  })
                  .then(async (t) => {
                    setGotToken(t);
                    postOAuthLogin(sdk);
                    setHasError(false);
                  })
                  .catch(() => {
                    setHasError(true);
                  })
                  .finally(() => {
                    // auth0 get the token in two steps
                    if (selectedClusterInfo?.type === AuthProviders.Auth0)
                      localStorage.setItem(AUTH0_TWO_STEP_KEY, '1');
                    else setIsInitializing(false);
                  });
              }}
              logout={() => {
                window.localStorage.removeItem('@cognite/sdk:accountLocalId');
                window.localStorage.removeItem('cognite__auth__v4_flow');
                window.sessionStorage.removeItem('login-clicked');
                clearOidcItems();
                setGotToken(false);
              }}
              isInitializing={isInitializing}
              isAuthenticated={gotToken}
              provider={provider}
            />
          )}
        </>
        {clustersWithLegacyAuth.map((c) => c.value).includes(cluster) && (
          <LegacyContainer>
            <LegacyLoginInput
              cluster={selectedClusterInfo?.cluster || ''}
              onTenantSelected={(tenant) => {
                saveTenantFlow(
                  { tenant, env: selectedClusterInfo?.cluster },
                  'COGNITE_AUTH'
                );
                move(tenant, 'tenant');
              }}
            />
          </LegacyContainer>
        )}
      </ContentWrapper>
      <HelpLink
        href="https://docs.cognite.com/cdf/access/troubleshooting/login.html"
        target="_blank"
        rel="noopener noreferrer"
      >
        Help <HelpLinkIcon type="ExternalLink" />
      </HelpLink>
    </Card>
  );
};

const LegacyContainer = styled.div`
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid var(--cogs-greyscale-grey3);
`;

const Card = styled.div`
  max-width: 100%;
  background: #fff;
  border-radius: 4px;
  box-sizing: border-box;
  box-shadow: 0px 16.8443px 50.5328px rgba(0, 0, 0, 0.1),
    0px 13.4754px 20.2131px rgba(0, 0, 0, 0.07);
`;

const ContentWrapper = styled.div`
  padding: 16px 32px 0;

  button {
    width: 100%;
    height: 40px;
  }

  .content {
    margin-top: 40px;
  }
`;

const HelpLink = styled.a`
  background-color: #fafafa;
  color: var(--cogs-text-color);
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
`;

const HelpLinkIcon = styled(Icon)`
  margin-left: 5px;
`;
