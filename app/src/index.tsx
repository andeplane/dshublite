import React from 'react';
import ReactDOM from 'react-dom';
import mixpanel from 'utils/mixpanel-frontend';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import './index.css';
import App from 'App';
import { SENTRY_DSN } from 'utils/config';
import reportWebVitals from './reportWebVitals';

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [new Integrations.BrowserTracing()],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
  enabled: !window.location.hostname.includes('localhost'),
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals((metric) => {
  mixpanel.track(metric.name, metric);
});
