import Serverless from 'serverless';
import { AkkaServerlessProvider } from './provider/provider';
import { AkkaServerlessCliPlugin } from './plugins/akkasls';
import { AkkaServerlessAuthicationPlugin } from './plugins/authication';
import { AkkaServerlessProjectResourcesPlugin } from './plugins/projectresources';
import { AkkaServerlessContainerRegistriesPlugin } from './plugins/containerregistries';
import { AkkaServerlessServicesPlugin } from './plugins/services';

export default class AkkaServerlessIndex {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public constructor(private _serverless: Serverless, private _options) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this._serverless.setProvider(AkkaServerlessProvider.getProviderName(), new AkkaServerlessProvider(_serverless) as any);
    this._serverless.pluginManager.addPlugin(AkkaServerlessCliPlugin);
    this._serverless.pluginManager.addPlugin(AkkaServerlessAuthicationPlugin);
    this._serverless.pluginManager.addPlugin(AkkaServerlessProjectResourcesPlugin);
    this._serverless.pluginManager.addPlugin(AkkaServerlessContainerRegistriesPlugin);
    this._serverless.pluginManager.addPlugin(AkkaServerlessServicesPlugin);
  }
}

module.exports = AkkaServerlessIndex;