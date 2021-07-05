import Serverless from 'serverless';
import { AkkaServerlessProvider } from './provider/provider';
import { AkkaServerlessCliPlugin } from './plugins/cli/cliPlugin';
import { AkkaServerlessAuthPlugin } from './plugins/auth/auth';
import { AkkaServerlessProjectResourcesPlugin } from './plugins/projects/resourcesPlugin';
import { AkkaServerlessDockerPlugin } from './plugins/projects/dockerPlugin';
import { AkkaServerlessServicesPlugin } from './plugins/services/services';

export default class AkkaServerlessIndex {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public constructor(private _serverless: Serverless, private _options) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this._serverless.setProvider(AkkaServerlessProvider.getProviderName(), new AkkaServerlessProvider(_serverless) as any);
    this._serverless.pluginManager.addPlugin(AkkaServerlessCliPlugin);
    this._serverless.pluginManager.addPlugin(AkkaServerlessAuthPlugin);
    this._serverless.pluginManager.addPlugin(AkkaServerlessProjectResourcesPlugin);
    this._serverless.pluginManager.addPlugin(AkkaServerlessDockerPlugin);
    this._serverless.pluginManager.addPlugin(AkkaServerlessServicesPlugin);
  }
}

module.exports = AkkaServerlessIndex;