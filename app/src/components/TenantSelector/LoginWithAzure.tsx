import React, { useState } from 'react';
import { Button, Input, Icon } from '@cognite/cogs.js';
import { saveFlow, getFlow } from '@cognite/auth-utils';

import { useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';
import Collapse from './Collapse';
import { AuthProviders } from './types';

const AdvancedOptionsContainer = styled.div`
  margin: 10px 0;
`;

type Props = {
  isAuthenticated: boolean;
  isInitializing: boolean;
  provider: AuthProviders;
  login: (directory?: string) => void;
  logout: () => void;
};

/**
 * Taken from https://github.com/cognitedata/cdf-hub-tenant-selector
 */

const generateButtonText = (
  isAuthenticated: boolean,
  provider: AuthProviders
) => {
  const title = isAuthenticated ? 'Sign out' : 'Sign in';
  if (provider === AuthProviders.Auth0) return title;
  return `${title} ${isAuthenticated ? 'from Microsoft' : 'with Microsoft'}`;
};

export default function LoginWithAzure({
  isAuthenticated,
  isInitializing,
  provider,
  login,
  logout,
}: Props) {
  const history = useHistory();
  const { flow, options } = getFlow();

  const [directory, setDirectory] = useState<string | undefined>(
    flow === 'AZURE_AD' ? options?.directory : undefined
  );

  const providerTitle = provider === AuthProviders.Azure ? 'Azure' : '';

  return (
    <>
      <Button
        style={{ height: 40, width: '100%', marginTop: 10 }}
        type="secondary"
        onClick={() => {
          if (isAuthenticated) {
            logout();
          } else {
            login(directory);
          }
        }}
      >
        {isInitializing ? (
          <Icon
            type="Loading"
            style={{ marginRight: 10, color: 'var(--cogs-greyscale-grey7)' }}
          />
        ) : null}
        {generateButtonText(isAuthenticated, provider)}
      </Button>
      <AdvancedOptionsContainer>
        <Collapse
          open={!!options?.directory}
          title={`Advanced ${providerTitle} options`}
        >
          <Input
            title={`Override ${providerTitle} tenant`}
            type="text"
            fullWidth
            value={`${directory || ''}`}
            placeholder="contoso.onmicrosoft.com"
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                saveFlow('AZURE_AD', { directory: directory?.trim() });
                history.go(0);
              }
            }}
            onChange={(e) => setDirectory(e.target.value)}
            postfix={
              <Button
                onClick={() => {
                  saveFlow('AZURE_AD', { directory: directory?.trim() });
                  history.go(0);
                }}
              >
                Set tenant
              </Button>
            }
          />
          <p>
            If your user is a guest user of the organization you are logging in
            to, specify it here.
          </p>
        </Collapse>
      </AdvancedOptionsContainer>
    </>
  );
}
