import Serverless from 'serverless';
import { BasePlugin } from './base';
import { Command } from '../utils/commandFactory';
import { config } from '../utils/config';

export class AkkaServerlessAuthicationPlugin extends BasePlugin {
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
    }

    private async _executeLogin(): Promise<void> {
        const command = new Command(config.commands.auth.login);

        command.setSilent(this.provider.quiet);
        command.setConfigFile(this.provider.config);
        command.setContext(this.provider.context);

        this.logger.info('Click on the URL below to authenticate...');
        await command.run();
    }

    private async _executeLogout(): Promise<void> {
        const command = new Command(config.commands.auth.logout);

        command.setSilent(this.provider.quiet);
        command.setConfigFile(this.provider.config);
        command.setContext(this.provider.context);

        await command.run();
    }
}