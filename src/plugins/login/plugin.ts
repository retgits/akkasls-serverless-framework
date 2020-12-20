/**
 * The aslogin command logs users into Akka Serverless.
 * It prints the login URL at the console to allow users to click and authenticate the
 * current session.
 */
import Serverless from 'serverless';
import { BasePlugin } from '../basePlugin';
import { Provider } from '../../datatypes';
import { login } from '@retgits/akkasls-nodewrapper';

export class ASLoginPlugin extends BasePlugin {
    private _provider: Provider;

    public constructor(serverless: Serverless, options: Serverless.Options) {
        super(serverless, options);

        // Add hooks
        this.hooks = {
            'aslogin:login': this._login.bind(this),
        };

        // Add commands
        this.commands = {
            aslogin: {
                usage: 'Login to Akka Serverless',
                lifecycleEvents: [
                    'login'
                ]
            }
        };

        // Create a structured object from the provider
        this._provider = this.serverless.service.provider;
    }

    private async _login() {
        this.log('Click on the URL below to authenticate your session...');
        await login({dryrun: false, silent: false, configFile: this._provider.config, context: this._provider.context});
    }
}