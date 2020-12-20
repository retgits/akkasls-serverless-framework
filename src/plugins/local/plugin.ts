import Serverless from 'serverless';
import { BasePlugin } from '../basePlugin';
import { Function, Provider } from '../../datatypes';
import { removeStageFromName, getDockerTag } from '../../utils/utils';
import { config } from '../../config';
import { Command } from '@retgits/akkasls-nodewrapper';

export class ASLocalPlugin extends BasePlugin {
    private _provider: Provider;

    public constructor(serverless: Serverless, options: Serverless.Options) {
        super(serverless, options);

        // Add hooks to start and stop local services
        this.hooks = {
            'local:local': this._local.bind(this),
            'local:start:start': this._start.bind(this),
            'local:stop:stop': this._stop.bind(this),
        };

        // Add commands to start and stop local services
        this.commands = {
            local: {
                usage: 'Start and stop services running locally',
                lifecycleEvents: [
                    'local'
                ],
                commands: {
                    start: {
                        usage: 'Start a service',
                        lifecycleEvents: [
                            'start'
                        ],
                        options: {
                            function: {
                                usage: 'Name of the service to start',
                                shortcut: 'f',
                                required: true,
                            }
                        }
                    },
                    stop: {
                        usage: 'Stop a service',
                        lifecycleEvents: [
                            'stop'
                        ],
                        options: {
                            function: {
                                usage: 'Name of the service to stop',
                                shortcut: 'f',
                                required: true,
                            }
                        }
                    }
                }
            }
        };

        // Create a structured object from the provider
        this._provider = this.serverless.service.provider;
    }

    private async _local() {
        this.log('You can use the local plugin to start and stop services locally');
    }

    private async _start() {
        // The required attribute of name will be validated by the Serverless Framework to exist
        // If there is no function with the associated name, an error will be thrown and execution
        // will halt automatically.
        // eslint-disable-next-line @typescript-eslint/ban-types
        const f: Function = this.serverless.service.getFunction(this.options.function);
        f.name = removeStageFromName(f.name, this._provider.stage);

        const tag = getDockerTag(f.tag);
        if (tag === config.defaults.tag) {
            this.warn(`${f.name} does not have a tag. Adding ${tag} for now, but this might cause issues while deploying...`);
        }

        const commands = [
            `docker network create -d bridge akkasls-${f.name}`,
            `docker run -d --name ${f.name} --hostname userfunction --network akkasls-${f.name} ${this._provider.docker.imageUser}/${f.name}:${tag}`,
            `docker run -d --name ${f.name}-proxy --network akkasls-${f.name} -p ${f.proxyHostPort}:9000 --env USER_FUNCTION_HOST=userfunction cloudstateio/cloudstate-proxy-dev-mode:latest`
        ];

        for (let index = 0; index < commands.length; index++) {
            const command = new Command(commands[index]);
            command.setSilent(true);
            const result = await command.run();
            this.log(result.stdout);
            if (result.stderr) {
                this.log(result.stderr);
            }
        }
    }

    private async _stop() {
        // The required attribute of name will be validated by the Serverless Framework to exist
        // If there is no function with the associated name, an error will be thrown and execution
        // will halt automatically.
        // eslint-disable-next-line @typescript-eslint/ban-types
        const f: Function = this.serverless.service.getFunction(this.options.function);
        f.name = removeStageFromName(f.name, this._provider.stage);

        const commands = [
            `docker stop ${f.name}`,
            `docker stop ${f.name}-proxy`,
            `docker rm ${f.name}`,
            `docker rm ${f.name}-proxy`,
            `docker network rm akkasls-${f.name}`
        ];

        for (let index = 0; index < commands.length; index++) {
            const command = new Command(commands[index]);
            command.setSilent(true);
            const result = await command.run();
            this.log(result.stdout);
            if (result.stderr) {
                this.log(result.stderr);
            }
        }
    }
}