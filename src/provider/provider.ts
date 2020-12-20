import Serverless from 'serverless';
import { config } from '../config';
import { validationSchema } from './schema';

export class AkkaServerlessProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _serverless: any;

  public static getProviderName(): string {
    return config.providerName;
  }

  public constructor(serverless: Serverless) {
    this._serverless = serverless;
    this._serverless.setProvider(config.providerName, this);

    if (this._serverless.service.provider.name === config.providerName) {
      serverless.configSchemaHandler.defineProvider(config.providerName, validationSchema);
    }
  }
}