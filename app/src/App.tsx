import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import '@cognite/cogs.js/dist/cogs.css';
import styled, {
  createGlobalStyle,
  ThemeProvider,
} from 'styled-components/macro';
import { StoreProvider } from 'easy-peasy';
import { InfoMessage } from 'components';

import {
  BrowserRouter as Router,
  Route,
  Switch,
  useLocation,
} from 'react-router-dom';
import React, { useEffect } from 'react';
import { LoginPage } from 'pages/LoginPage/LoginPage';
import { HomePage } from 'pages/HomePage/HomePage';
import { useStoreState } from 'hooks';
import { useUrl } from 'hooks/useUrls';
import { Button, Loader } from '@cognite/cogs.js';
import { QueryClient, QueryClientProvider } from 'react-query';

import store from 'store';

import { useLogin } from 'store/auth';
import { useQuery } from 'hooks/useQuery';
import { useStatefulHistory } from './hooks/history';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`;

const StyledPage = styled.div`
  display: flex;
  flex-flow: column;
  height: 100%;
  background-color: #f5f5f5;
`;

const StyledWrapper = styled.div`
  overflow: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const theme = {
  colors: {
    primary: '#6E85FC',
    primary_background: '#EDF0FF',
  },
};

const queryClient = new QueryClient();

export default function MyApp() {
  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <StoreProvider store={store}>
            <Router>
              <StyledPage>
                <Switch>
                  <Route exact path="/">
                    <LoginPage />
                  </Route>
                  <Route path="/:tenantId">
                    <RedirectToUrlTenant>
                      <StyledWrapper>
                        <Switch>
                          <Route exact path="/:tenantId">
                            {/* <Header /> */}
                            <HomePage />
                          </Route>
                        </Switch>
                      </StyledWrapper>
                    </RedirectToUrlTenant>
                  </Route>
                </Switch>
              </StyledPage>
            </Router>
          </StoreProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </>
  );
}

const RedirectToUrlTenant = ({
  children = null,
}: {
  children: React.ReactNode;
}) => {
  const isSignedIn = useStoreState((state) => state.auth.loggedIn);
  const tenant = useStoreState((state) => state.auth.tenant);
  const login = useLogin();
  const urlTenant = useUrl.Tenant();

  const method = useQuery.Method();

  const search = new URLSearchParams(useLocation().search);

  const history = useStatefulHistory();

  useEffect(() => {
    // when the url tenant and the stored tenant is not the same, try to login with oauth
    if (tenant !== urlTenant) {
      login({ tenant: urlTenant, useOIDC: method === 'oauth' });
    }
  }, [tenant, urlTenant, login]);

  useEffect(() => {
    // first time loading back into `tenant`
    try {
      if (isSignedIn === undefined) {
        if (method === 'oauth' && tenant === urlTenant) {
          login({ tenant, useOIDC: true });
        } else if (method === 'tenant' && tenant === urlTenant) {
          login({ tenant, token: search.get('access_token') || undefined });
        }
      }
    } catch (e) {
      history.push('/');
    }
  }, [isSignedIn, login, method]);

  if (!method) {
    return (
      <>
        <InfoMessage type="Error" title="Unable to log in">
          <>
            <p>Unable to determine your login method, please sign in again</p>
            <Button
              icon="ArrowRight"
              iconPlacement="right"
              type="primary"
              onClick={() => history.push('/')}
            >
              Sign in again
            </Button>
          </>
        </InfoMessage>
      </>
    );
  }

  if (isSignedIn === undefined) {
    return <Loader darkMode />;
  }
  return <>{children}</>;
};
