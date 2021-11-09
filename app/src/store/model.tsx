import { AuthModel, authModel } from './auth';
import { SdkModel, sdkModel } from './sdk';

export interface StoreModel {
  auth: AuthModel;
  sdk: SdkModel;
}
export const storeModel: StoreModel = {
  auth: authModel,
  sdk: sdkModel,
};
