export type Clusters = {
  label: string;
  options: Cluster[];
}[];

export enum AuthProviders {
  Azure,
  Auth0,
}

export type Cluster = {
  cluster: string;
  value: string;
  label: string;
  legacyAuth?: boolean;
  disableAad?: boolean;
  type?: AuthProviders;
  configurationUrl?: string;
  clientId?: string;
};

export type ClientInfo = {
  provider: AuthProviders;
  id: string;
  cluster?: string;
  configurationUrl?: string;
};
