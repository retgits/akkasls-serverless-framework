import Serverless from 'serverless';
import { BasePlugin } from './base';
import { Command } from '../utils/commandFactory';
import { AkkaServerlessService } from '../models/serverless';
import { getService } from '../utils/utils';
import { join } from 'path';
import { existsSync } from 'fs';
import { config } from '../utils/config';

export class AkkaServerlessServicesPlugin extends BasePlugin {
    private _dryrun: boolean;

    public constructor(serverless: Serverless, options: Serverless.Options) {
        super(serverless, options);

        // Remove the default package:createDeploymentArtifacts so it can be overridden by this plugin
        delete this.serverless.pluginManager.hooks['package:createDeploymentArtifacts'];

        this.commands = {
            package: {
                usage: 'Package services into containers',
                lifecycleEvents: ['createDeploymentArtifacts'],
                options: {
                    service: {
                        usage: 'Name of service to package',
                        required: false,
                        type: 'string'
                    },
                    push: {
                        usage: 'Push packaged container(s) to the container registry',
                        required: false,
                        type: 'boolean'
                    }
                }
            },
            asdeploy: {
                usage: 'Deploy services to Akka Serverless',
                lifecycleEvents: ['deployArtifacts'],
                options: {
                    service: {
                        usage: 'Name of service to deploy',
                        required: false,
                        type: 'string'
                    },
                    expose: {
                        usage: 'When set, adds an HTTP endpoint to your service',
                        required: false,
                        type: 'boolean'
                    },
                    dryrun: {
                        usage: 'When set, only prints the commands without execution',
                        required: false,
                        type: 'boolean'
                    }
                }
            },
            remove: {
                usage: 'Remove services from Akka Serverless',
                lifecycleEvents: ['removeArtifacts'],
                options: {
                    service: {
                        usage: 'Name of service to remove',
                        required: false,
                        type: 'string'
                    },
                    dryrun: {
                        usage: 'When set, only prints the commands without execution',
                        required: false,
                        type: 'boolean'
                    }
                }
            },
            aslogs: {
                usage: 'Get the latest logs of a service',
                lifecycleEvents: ['logs'],
                options: {
                    service: {
                        usage: 'Name of service to remove',
                        required: true,
                        type: 'string'
                    },
                    dryrun: {
                        usage: 'When set, only prints the commands without execution',
                        required: false,
                        type: 'boolean'
                    }
                }
            },
            local: {
                usage: 'Start or stop a service running locally',
                lifecycleEvents: ['local'],
                options: {
                    service: {
                        usage: 'Name of service to remove',
                        required: true,
                        type: 'string'
                    },
                    command: {
                        usage: 'Either start or stop',
                        required: true,
                        type: 'string'
                    },
                    dryrun: {
                        usage: 'When set, only prints the commands without execution',
                        required: false,
                        type: 'boolean'
                    }
                }
            }
        };

        this.hooks = {
            'package:createDeploymentArtifacts': this._createDeploymentArtifacts.bind(this),
            'asdeploy:deployArtifacts': this._deployArtifacts.bind(this),
            'remove:removeArtifacts': this._removeArtifacts.bind(this),
            'aslogs:logs': this._getLogs.bind(this),
            'local:local': this._runLocal.bind(this),
        };

        const services = Object.keys(serverless.configurationInput.services);
        this.config.services = [];
        for (let index = 0; index < services.length; index++) {
            const service = serverless.configurationInput.services[services[index]] as AkkaServerlessService;
            service.name = services[index];
            this.config.services.push(service);
        }

        // The conversion of type 'string' (which is the result from getOption) to type 'boolean' tricks 
        // the compiler in thinking there might be no overlap. That's why the expression is converted to 
        // 'unknown' first.
        this._dryrun = this.getOption('dryrun', false) as unknown as boolean;
    }

    private async _runLocal(): Promise<void> {
        const service = getService(this.options.service, this.config.services);

        if (service === undefined) {
            this.error(`service ${this.options.service} is not found in serverless.yml`);
            return;
        }

        let cmds: string[] = [];

        if(this.options.service.command === 'start') {
            let imagename = service.imagename;
            if (service.tag) {
                imagename += `:${service.tag}`;
            }

            cmds = [
                `docker network create -d bridge akkasls-${service.name}`,
                `docker run -d --name ${service.name} --hostname userfunction --network akkasls-${service.name} ${imagename}`,
                `docker run -d --name ${service.name}-proxy --network akkasls-${service.name} -p ${service.proxyPort}:9000 --env USER_FUNCTION_HOST=userfunction gcr.io/akkaserverless-public/akkaserverless-proxy:latest -Dconfig.resource=dev-mode.conf -Dcloudstate.proxy.protocol-compatibility-check=false`
            ];
        } else if (this.options.service.command === 'stop') {
            cmds = [
                `docker stop ${service.name}`,
                `docker stop ${service.name}-proxy`,
                `docker rm ${service.name}`,
                `docker rm ${service.name}-proxy`,
                `docker network rm akkasls-${service.name}`
            ];
        } else {
            this.error(`Unknown command ${this.options.service.command}, choose either 'start' or 'stop'`);
            return;
        }

        for (let index = 0; index < cmds.length; index++) {
            const command = new Command(cmds[index]);
            const result = await command.run();
            this.info(result.stdout);
            if (result.stderr) {
                this.error(result.stderr);
            }
        }
    }

    private async _getLogs(): Promise<void> {
        const service = getService(this.options.service, this.config.services);

        if (service === undefined) {
            this.error(`service ${this.options.service} is not found in serverless.yml`);
            return;
        }

        const command = new Command(config.commands.projects.services.logs);
        command.addParameter({ addNameToCommand: false, name: 'name', value: service.name });
        command.addParameter({ addNameToCommand: true, name: 'instance', value: '' });
        command.addParameter({ addNameToCommand: true, name: 'lifecycle', value: '' });
        command.addParameter({ addNameToCommand: true, name: 'project', value: this.config.project.project });

        command.setSilent(this.provider.quiet);
        command.setConfigFile(this.provider.config);
        command.setContext(this.provider.context);

        if (this._dryrun) {
            this.logger.debug((await command.dryRun()).stdout);
            return;
        }

        await command.run();
    }

    private async _removeArtifacts(): Promise<void> {
        if (this.options.service) {
            const service = getService(this.options.service, this.config.services);

            if (service === undefined) {
                this.error(`service ${this.options.service} is not found in serverless.yml`);
                return;
            }

            await this._removeService(service);
        } else {
            this.config.services.forEach(async (service) => {
                await this._removeService(service);
            });
        }
    }

    private async _removeService(service: AkkaServerlessService): Promise<void> {
        const command = new Command(config.commands.projects.services.delete);
        command.addParameter({ addNameToCommand: false, name: 'name', value: service.name });
        command.addParameter({ addNameToCommand: true, name: 'project', value: this.config.project.project });

        command.setSilent(this.provider.quiet);
        command.setConfigFile(this.provider.config);
        command.setContext(this.provider.context);

        if (this._dryrun) {
            this.logger.debug((await command.dryRun()).stdout);
        }

        await command.run();
    }

    private async _createDeploymentArtifacts(): Promise<void> {
        // The conversion of type 'string' (which is the result from getOption) to type 'boolean' tricks the compiler in thinking there might be no overlap. 
        // That's why the expression is converted to 'unknown' first.
        const push = this.getOption('push', false) as unknown as boolean;

        if (this.options.service) {
            const service = getService(this.options.service, this.config.services);

            if (service === undefined) {
                this.error(`service ${this.options.service} is not found in serverless.yml`);
                return;
            }

            await this._buildContainer(service, push);
        } else {
            this.config.services.forEach(async (service) => {
                await this._buildContainer(service, push);
            });
        }
    }

    private async _deployArtifacts(): Promise<void> {
        // The conversion of type 'string' (which is the result from getOption) to type 'boolean' tricks the compiler in thinking there might be no overlap. 
        // That's why the expression is converted to 'unknown' first.
        const expose = this.getOption('expose', false) as unknown as boolean;

        if (this.options.service) {
            const service = getService(this.options.service, this.config.services);

            if (service === undefined) {
                this.error(`service ${this.options.service} is not found in serverless.yml`);
                return;
            }

            await this._deployContainer(service, expose);
        } else {
            this.config.services.forEach(async (service) => {
                await this._deployContainer(service, expose);
            });
        }
    }

    private async _deployContainer(service: AkkaServerlessService, expose: boolean): Promise<void> {
        const command = new Command(config.commands.projects.services.deploy);
        command.addParameter({ addNameToCommand: false, name: 'name', value: service.name });
        command.addParameter({ addNameToCommand: false, name: 'image', value: service.imagename });
        command.addParameter({ addNameToCommand: true, name: 'project', value: this.config.project.project });

        if (service.environment) {
            const vars: string[] = [];
            const keys = Object.keys(service.environment);
            for (let index = 0; index < keys.length; index++) {
                const element = service.environment[keys[index]];
                vars.push(`${keys[index]}="${element}"`);
            }
            command.addParameter({ addNameToCommand: true, name: 'env', value: vars.join(',') });
        }

        command.setSilent(this.provider.quiet);
        command.setConfigFile(this.provider.config);
        command.setContext(this.provider.context);

        if (this._dryrun) {
            this.logger.debug((await command.dryRun()).stdout);
        } else {
            await command.run();
        }

        if (expose) {
            const command = new Command(config.commands.projects.services.expose);
            command.addParameter({ addNameToCommand: false, name: 'name', value: service.name });
            command.addParameter({ addNameToCommand: true, name: 'enable-cors', value: '' });
            command.addParameter({ addNameToCommand: true, name: 'project', value: this.config.project.project });

            if (this._dryrun) {
                this.logger.debug((await command.dryRun()).stdout);
                return;
            }

            await command.run();
        }
    }

    private async _buildContainer(service: AkkaServerlessService, push: boolean): Promise<void> {
        if (!service.skipBuild) {
            if (!existsSync(join(process.cwd(), service.folder))) {
                this.error(`folder ${join(process.cwd(), service.folder)} does not exist`);
                return;
            }

            let imagename = service.imagename;
            if (service.tag) {
                imagename += `:${service.tag}`;
            }
            const command = new Command(`docker build . -f ${service.dockerfile} -t ${imagename}`, join(process.cwd(), service.folder));
            const result = await command.run();
            this.info(result.stdout);
            if (result.stderr) {
                this.error(result.stderr);
            }
        } else {
            this.info(`skipping build for ${service.name}`);
        }

        if (push) {
            let imagename = service.imagename;
            if (service.tag) {
                imagename += `:${service.tag}`;
            }

            const command = new Command(`docker push ${imagename}`);
            const result = await command.run();
            this.info(result.stdout);
            if (result.stderr) {
                this.error(result.stderr);
            }
        }
    }
}