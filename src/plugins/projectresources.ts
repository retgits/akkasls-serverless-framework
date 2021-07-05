import Serverless from 'serverless';
import { BasePlugin } from './base';
import { Command, commands } from '../utils/commandFactory';
import { AkkaServerlessProviderConfig } from '../models/serverless';

export class AkkaServerlessProjectResourcesPlugin extends BasePlugin {
    private _asProvider: AkkaServerlessProviderConfig;
    private _dryrun: boolean;

    public constructor(serverless: Serverless, options: Serverless.Options) {
        super(serverless, options);

        this.commands = {
            'set-broker': {
                usage: 'Set the messaging broker for the project',
                lifecycleEvents: ['set-broker'],
                options: {
                    dryrun: {
                        usage: 'When set, only prints the commands without execution',
                        required: false,
                        type: 'boolean'
                    }
                }
            },
            'set-log-aggregator': {
                usage: 'Set the log aggregator for the project',
                lifecycleEvents: ['set-log-aggregator'],
                options: {
                    dryrun: {
                        usage: 'When set, only prints the commands without execution',
                        required: false,
                        type: 'boolean'
                    }
                }
            },
            'set-all': {
                usage: 'Set the log aggregator and broker for the project',
                lifecycleEvents: ['set-log-aggregator', 'set-broker'],
                options: {
                    dryrun: {
                        usage: 'When set, only prints the commands without execution',
                        required: false,
                        type: 'boolean'
                    }
                }
            },
            'unset-broker': {
                usage: 'Unset the messaging broker for the project',
                lifecycleEvents: ['unset-broker'],
                options: {
                    dryrun: {
                        usage: 'When set, only prints the commands without execution',
                        required: false,
                        type: 'boolean'
                    }
                }
            },
            'unset-log-aggregator': {
                usage: 'Unset the log aggregator for the project',
                lifecycleEvents: ['unset-log-aggregator'],
                options: {
                    dryrun: {
                        usage: 'When set, only prints the commands without execution',
                        required: false,
                        type: 'boolean'
                    }
                }
            },
            'unset-all': {
                usage: 'Unset the log aggregator and broker for the project',
                lifecycleEvents: ['unset-log-aggregator', 'unset-broker'],
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
            'set-broker:set-broker': this._executeSetBroker.bind(this),
            'set-log-aggregator:set-log-aggregator': this._executeSetLogAggregator.bind(this),
            'set-all:set-broker': this._executeSetBroker.bind(this),
            'set-all:set-log-aggregator': this._executeSetLogAggregator.bind(this),
            'unset-broker:unset-broker': this._executeUnsetBroker.bind(this),
            'unset-log-aggregator:unset-log-aggregator': this._executeUnsetLogAggregator.bind(this),
            'unset-all:unset-broker': this._executeUnsetBroker.bind(this),
            'unset-all:unset-log-aggregator': this._executeUnsetLogAggregator.bind(this),
        };

        this._asProvider = this.serverless.service.provider;

        // The conversion of type 'string' (which is the result from getOption) to type 'boolean' tricks 
        // the compiler in thinking there might be no overlap. That's why the expression is converted to 
        // 'unknown' first.
        this._dryrun = this.getOption('dryrun', false) as unknown as boolean;
    }

    private async _executeSetBroker(): Promise<void> {
        const command = new Command(commands.projects.resources.setBroker);

        command.setSilent(this._asProvider.quiet);
        command.setConfigFile(this._asProvider.config);
        command.setContext(this._asProvider.context);

        command.addParameter({addNameToCommand: true, name: 'broker-service', value: 'gcp-pubsub'});
        command.addParameter({addNameToCommand: true, name: 'gcp-key-file', value: this.config.project.broker.keyFile});
        command.addParameter({addNameToCommand: true, name: 'project', value: this.config.project.project});

        if (this._dryrun) {
            this.logger.debug((await command.dryRun()).stdout);
            return;
        }

        await command.run();
    }

    private async _executeSetLogAggregator(): Promise<void> {
        const command = new Command(commands.projects.resources.setLogAggregator);

        command.setSilent(this._asProvider.quiet);
        command.setConfigFile(this._asProvider.config);
        command.setContext(this._asProvider.context);

        command.addParameter({addNameToCommand: true, name: 'log-service', value: 'stackdriver'});
        command.addParameter({addNameToCommand: true, name: 'gcp-key-file', value: this.config.project.logAggregator.keyFile});
        command.addParameter({addNameToCommand: true, name: 'project', value: this.config.project.project});

        if (this._dryrun) {
            this.logger.debug((await command.dryRun()).stdout);
            return;
        }

        await command.run();
    }

    private async _executeUnsetBroker(): Promise<void> {
        const command = new Command(commands.projects.resources.unsetBroker);

        command.setSilent(this._asProvider.quiet);
        command.setConfigFile(this._asProvider.config);
        command.setContext(this._asProvider.context);

        command.addParameter({addNameToCommand: true, name: 'project', value: this.config.project.project});

        if (this._dryrun) {
            this.logger.debug((await command.dryRun()).stdout);
            return;
        }

        await command.run();
    }

    private async _executeUnsetLogAggregator(): Promise<void> {
        const command = new Command(commands.projects.resources.unsetLogAggregator);

        command.setSilent(this._asProvider.quiet);
        command.setConfigFile(this._asProvider.config);
        command.setContext(this._asProvider.context);

        command.addParameter({addNameToCommand: true, name: 'project', value: this.config.project.project});

        if (this._dryrun) {
            this.logger.debug((await command.dryRun()).stdout);
            return;
        }

        await command.run();
    }
}