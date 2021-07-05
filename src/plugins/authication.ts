import Serverless from 'serverless';
import { BasePlugin } from './base';
import { Command, commands } from '../utils/commandFactory';
import { AkkaServerlessProviderConfig } from '../models/serverless';

export class AkkaServerlessAuthicationPlugin extends BasePlugin {
    private _asProvider: AkkaServerlessProviderConfig;

    public constructor(serverless: Serverless, options: Serverless.Options) {
        super(serverless, options);

        this.commands = {
            aslogin: {
                usage: 'Login to Akka Serverless',
                lifecycleEvents: ['aslogin'],
            },
            aslogout: {
                usage: 'Logout from Akka Serverless',
                lifecycleEvents: ['aslogout'],
            }
        };

        this.hooks = {
            'aslogin:aslogin': this._executeLogin.bind(this),
            'aslogout:aslogout': this._executeLogout.bind(this),
        };

        this._asProvider = this.serverless.service.provider;
    }

    private async _executeLogin(): Promise<void> {
        const command = new Command(commands.auth.login);

        command.setSilent(this._asProvider.quiet);
        command.setConfigFile(this._asProvider.config);
        command.setContext(this._asProvider.context);

        this.logger.info('Click on the URL below to authenticate...');
        await command.run();
    }

    private async _executeLogout(): Promise<void> {
        const command = new Command(commands.auth.logout);

        command.setSilent(this._asProvider.quiet);
        command.setConfigFile(this._asProvider.config);
        command.setContext(this._asProvider.context);

        await command.run();
    }
}