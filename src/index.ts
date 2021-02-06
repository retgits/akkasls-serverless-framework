import Serverless from 'serverless';
import { AkkaServerlessProvider } from './provider/provider';
import { ASDeployPlugin } from './plugins/deploy/plugin';
//invoke
import { ASLocalPlugin } from './plugins/local/plugin';
import { ASLogPlugin } from './plugins/log/plugin';
import { ASLoginPlugin } from './plugins/login/plugin';
import { ASPackagePlugin } from './plugins/package/plugin';
import { ASRemovePlugin } from './plugins/remove/plugin';

export default class AkkaServerlessIndex {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public constructor(private _serverless: Serverless, private _options) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this._serverless.setProvider(AkkaServerlessProvider.getProviderName(), new AkkaServerlessProvider(_serverless) as any);
    this._serverless.pluginManager.addPlugin(ASLoginPlugin);
    this._serverless.pluginManager.addPlugin(ASRemovePlugin);
    this._serverless.pluginManager.addPlugin(ASPackagePlugin);
    this._serverless.pluginManager.addPlugin(ASDeployPlugin);
    this._serverless.pluginManager.addPlugin(ASLocalPlugin);
    this._serverless.pluginManager.addPlugin(ASLogPlugin);
  }
}

module.exports = AkkaServerlessIndex;