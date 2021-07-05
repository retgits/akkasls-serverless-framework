import Serverless from 'serverless';
import { BasePlugin } from '../basePlugin';
import { Command, commands } from '../../utils/commandFactory';
import { AkkaServerlessProviderConfig } from '../../models/serverless';
import { Credential } from '../../models/cli';

export class AkkaServerlessDockerPlugin extends BasePlugin {
    private _asProvider: AkkaServerlessProviderConfig;
    private _dryrun: boolean;

    public constructor(serverless: Serverless, options: Serverless.Options) {
        super(serverless, options);

        this.commands = {
            'set-registries': {
                usage: 'Set your container registries to the ones supplied in serverless.yml',
                lifecycleEvents: ['unset-registries','set-registries'],
                options: {
                    dryrun: {
                        usage: 'When set, only prints the commands without execution',
                        required: false,
                        type: 'boolean'
                    }
                }
            },
            'unset-registries': {
                usage: 'Remove all container registries',
                lifecycleEvents: ['unset-registries'],
                options: {
                    dryrun: {
                        usage: 'When set, only prints the commands without execution',
                        required: false,
                        type: 'boolean'
                    }
                }
            }
        };

        this.hooks = {
            'unset-registries:unset-registries': this._executeUnsetRegistries.bind(this),
            'set-registries:unset-registries': this._executeUnsetRegistries.bind(this),
            'set-registries:set-registries': this._executeSetRegistries.bind(this),
        };

        this._asProvider = this.serverless.service.provider;

        // The conversion of type 'string' (which is the result from getOption) to type 'boolean' tricks 
        // the compiler in thinking there might be no overlap. That's why the expression is converted to 
        // 'unknown' first.
        this._dryrun = this.getOption('dryrun', false) as unknown as boolean;
    }

    private async _executeSetRegistries(): Promise<void> {
        const credentials = await this.config.project.registries;

        for (let index = 0; index < credentials.length; index++) {
            const credential = credentials[index];

            const command = new Command(commands.projects.docker.addDockerCredentials);
            command.addParameter({addNameToCommand: true, name: 'project', value: this.config.project.project});
            command.addParameter({addNameToCommand: true, name: 'docker-server', value: credential.registryUrl});

            if(credential.email) {
                command.addParameter({addNameToCommand: true, name: 'docker-email', value: credential.email});
            }

            if(credential.password) {
                command.addParameter({addNameToCommand: true, name: 'docker-password', value: credential.password});
            }

            if(credential.username) {
                command.addParameter({addNameToCommand: true, name: 'docker-username', value: credential.username});
            }

            command.setSilent(this._asProvider.quiet);
            command.setConfigFile(this._asProvider.config);
            command.setContext(this._asProvider.context);

            if (this._dryrun) {
                this.logger.debug((await command.dryRun()).stdout);
                continue;
            }

            await command.run();
        }

        return;
    }

    private async _executeUnsetRegistries(): Promise<void> {
        const credentials = await this._getRegistries();

        for (let index = 0; index < credentials.length; index++) {
            const credential = credentials[index];

            const command = new Command(commands.projects.docker.deleteDockerCredentials);

            command.setSilent(this._asProvider.quiet);
            command.setConfigFile(this._asProvider.config);
            command.setContext(this._asProvider.context);

            const name = credential.name.split('/');

            command.addParameter({addNameToCommand: false, name: 'credentialID', value: name[name.length - 1]});
            command.addParameter({addNameToCommand: true, name: 'project', value: this.config.project.project});

            if (this._dryrun) {
                this.logger.debug((await command.dryRun()).stdout);
                continue;
            }

            await command.run();
        }

        return;
    }

    private async _getRegistries(): Promise<Credential[]> {
        const command = new Command(commands.projects.docker.listDockerCredentials);

        command.setSilent(this._asProvider.quiet);
        command.setConfigFile(this._asProvider.config);
        command.setContext(this._asProvider.context);

        command.addParameter({addNameToCommand: true, name: 'project', value: this.config.project.project});

        const result = await command.run();
        return JSON.parse(result.stdout) as Credential[];
    }
}