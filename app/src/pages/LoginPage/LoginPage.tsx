import React, { useState, useEffect, useMemo } from 'react';
import { useStoreState } from 'hooks';
import { Form, notification, Input } from 'antd';
import { Button } from '@cognite/cogs.js';
import styled from 'styled-components/macro';
import { useLocation } from 'react-router-dom';
import { useLogin } from 'store/auth';
import { useStatefulHistory } from 'hooks/history';
import { stringify } from 'query-string';
import { useQuery } from 'hooks/useQuery';
import { OIDCLogin } from './OIDCLogin';

export const LoginPage = () => {
  const storeApiKey = useStoreState((state) => state.auth.apiKey);
  const storeTenant = useStoreState((state) => state.auth.tenant);

  const login = useLogin();

  const [apiKey, setApiKey] = useState('');
  const [tenant, setTenant] = useState('');
  const [isLoading, setLoading] = useState(false);

  const { search } = useLocation();

  const queryParams = useMemo(() => new URLSearchParams(search), [search]);

  useEffect(() => {
    setApiKey(storeApiKey || '');
    setTenant(storeTenant || '');
  }, [storeApiKey, storeTenant]);

  useEffect(() => {
    if (queryParams.get('id_token') && tenant) {
      // if the search parameter (search/query parameter containing the token) exist and
      // the tenant exist, then pass to sdk to login
      onLogIn();
    }
  }, [queryParams, tenant]);

  const history = useStatefulHistory();

  const method = useQuery.Method() || 'oauth';

  const isApiKeyActive = method === 'apikey';
  const isOAuthActive = method === 'oauth' || method === 'tenant';

  const isLoginAllowed = apiKey.trim().length !== 0;

  const onLogIn = async () => {
    if (!isLoginAllowed) {
      notification.error({
        message: 'You must provide a CDF project or a valid API key',
        description: 'Are you sure you entered a valid api key to your tenant?',
      });
      return;
    }
    setLoading(true);
    try {
      let success = false;
      let project: undefined | string = '';

      ({ tenant: project, loggedIn: success } = await login({ apiKey }));
      if (!success) {
        throw new Error('Unable to login');
      }
      history.push({
        pathname: `/${project}`,
        search: stringify({ method }),
      });
    } catch (ex) {
      notification.error({
        message: 'Could not log you in',
        description: 'Are you sure you entered a valid api key to your tenant?',
      });
    }
    setLoading(false);
  };

  return (
    <div style={{ overflow: 'auto', scrollBehavior: 'smooth' }}>
      <LoginPageContainer>
        <LoginWrapper>
          <div className="content">
            <LoginContent>
              <div>
                <Title style={{ color: 'white' }}>Welcome to DSHub lite!</Title>
                <Description>
                  DSHub lite is a Jupyter notebook run entirely in the browser.
                  This allows you to quickly get access to data through Python
                  notebooks, with packages like pandas, numpy and matplotlib
                  available.
                </Description>
              </div>
              <Form
                style={{ marginLeft: '6.625rem' }}
                onFinish={() => {
                  onLogIn();
                }}
              >
                {isApiKeyActive && (
                  <>
                    <FormItem>
                      <Input.Password
                        name="apikey"
                        data-id="api-key-input"
                        onChange={(event) => {
                          setApiKey(event.target.value);
                        }}
                        value={apiKey}
                        placeholder="Enter API key"
                      />
                    </FormItem>
                    <StyledButton
                      loading={isLoading}
                      block
                      htmlType="submit"
                      disabled={!isLoginAllowed || isLoading}
                      type="primary"
                    >
                      Access CDF EPC
                    </StyledButton>
                  </>
                )}
                {isOAuthActive && <OIDCLogin />}
              </Form>
            </LoginContent>
          </div>
        </LoginWrapper>
      </LoginPageContainer>
    </div>
  );
};

const LoginPageContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-image: url('/images/login-screen.png');
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 103% 103%;
`;

const LoginWrapper = styled.div`
  width: 100%;
  color: #ffffff;
  background: #1b21409a;
  margin: auto;
  padding: 50px 120px;

  .content {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
  }
`;

const LoginContent = styled.div`
  display: grid;
  grid-template-columns: 50% 50%;
  align-items: center;
`;

const FormItem = styled(Form.Item)`
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-weight: 700;
  font-size: 2.25rem;
  margin-bottom: 1.25rem;
`;

const Description = styled.p`
  font-size: 1rem;
  line-height: 1.5rem;
`;

const StyledButton = styled(Button)`
  &.cogs-btn-disabled {
    color: #ffffff;
    background: var(--cogs-primary);
    opacity: 0.7;
    cursor: not-allowed !important;
    &:hover {
      background: var(--cogs-primary);
      color: #ffffff;
    }
  }
`;
