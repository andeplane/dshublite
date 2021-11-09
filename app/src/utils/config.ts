export const MIXPANEL_TOKEN =
  process.env.REACT_APP_MIXPANEL_TOKEN || '5f3a6ec03d80d0fa9060df18ed5e904d';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const ITG_BACKEND =
  process.env.REACT_APP_ITG_BACKEND !== undefined
    ? process.env.REACT_APP_ITG_BACKEND
    : 'http://localhost:3001';
export const SENTRY_DSN =
  process.env.REACT_APP_SENTRY_DSN ||
  'https://4d2cda209a85422a852467120e95a503@o124058.ingest.sentry.io/5606883';
export const UNLEASH_FLAG_PROVIDER_API_TOKEN =
  'v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE';
export const INGESTION_API_URL =
  process.env.NODE_ENV === 'development'
    ? `${ITG_BACKEND}/api/v2/projects`
    : '/api/v2/projects';

// Documentation (Docusaurus)
const hostDocs =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3003' : '';

export const URL_DOCS = `${hostDocs}/docs`;
export const STATUS_PAGE_LINK = `http://cdf-epc.statuspage.io`;
export const URL_DATA_INGESTION_MANUAL = `${hostDocs}/docs/tutorials/data-ingestion/ingesting-data`;
export const URL_CLI_MANUAL = `${hostDocs}/docs/tutorials/cli/getting-started`;
export const URL_DATA_ACCESS_CONTROL = `${hostDocs}/docs/tutorials/access-control#data-access-control`;
export const URL_DATA_ACCESS_CONTROL_RULE = `${hostDocs}/docs/tutorials/access-control#custom-filters`;
export const URL_REQUIREMENTS_JSON_FOR_API = `${hostDocs}/docs/tutorials/data-ingestion/requirements-json-data`;
export const URL_SCHEMA_DOCS = `${hostDocs}/docs/schema`;
export const URL_CLI_SCHEMA = `${hostDocs}/docs/tutorials/cli/schema`;
export const URL_DATA_INGESTION_JSON = `${hostDocs}/docs/#ingesting-data`;

export const NUMBER_OF_RAW_ROWS_FOR_DATA_TRANSFORMATION = 20;

export const URL_POLICY = 'https://www.cognite.com/en/policy';
export const URL_ACADEMY = 'https://www.cognite.com/en/academy';
