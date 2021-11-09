import { CogniteClient } from '@cognite/sdk';
import { action, Action } from 'easy-peasy';
import { useStoreActions, useStoreState } from 'hooks';

export interface SdkModel {
  sdk: CogniteClient;
  resetSdk: Action<SdkModel, CogniteClient>;
}

export const sdkModel: SdkModel = {
  sdk: new CogniteClient({ appId: 'il-tempo-gigante' }),
  resetSdk: action((state, newClient) => {
    state.sdk = newClient;
  }),
};

export const useSdk = () => useStoreState((store) => store.sdk.sdk);
export const useResetSdk = () => useStoreActions((store) => store.sdk.resetSdk);
