/**
 * The package command builds all containers and optionally pushes 
 * them to a container registry as well. You can specify a single single
 * container with the -f option.
 */
import Serverless from 'serverless';
import { BasePlugin } from '../basePlugin';
import { Function, Provider } from '../../datatypes';
import { Command } from '@retgits/akkasls-nodewrapper';
import { getDockerTag, removeStageFromName } from '../../utils/utils';
import { join } from 'path';
import { config } from "../../config";

export class ASPackagePlugin extends BasePlugin {
    private _provider: Provider;

    public constructor(serverless: Serverless, options: Serverless.Options) {
        super(serverless, options);

        // Remove the default package:createDeploymentArtifacts so it can be 
        // overridden by this plugin
        delete this.serverless.pluginManager.hooks['package:createDeploymentArtifacts'];

        // Add hooks
        this.hooks = {
            'package:createDeploymentArtifacts': this._build.bind(this),
        };

        // Add commands
        this.commands = {
            package: {
                usage: 'Package functions into containers',
                lifecycleEvents: [],
                options: {
                    function: {
                        usage: 'Name of function to package',
                        shortcut: 'f',
                        required: false,
                    },
                    push: {
                        usage: 'Push packaged container(s) to the container registry',
                        required: false
                    }
                }
            }
        };

        // Create a structured object from the provider
        this._provider = this.serverless.service.provider;
    }

    private async _build() {
        // The conversion of type 'string' (which is the result from getOption) to type 'boolean' tricks the compiler in thinking there might be no overlap. 
        // That's why the expression is converted to 'unknown' first.
        const push = this.getOption('push', false) as unknown as boolean;

        const name = this.options.function;
        if (name) {
            const f = this.serverless.service.getFunction(name);
            await this._buildContainer(f, push);
        } else {
            this.serverless.service.getAllFunctions().map(async (func) => {
                const f = this.serverless.service.getFunction(func);
                await this._buildContainer(f, push);
            });
        }
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    private async _buildContainer(f: Function, p: boolean) {
        f.name = removeStageFromName(f.name, this._provider.stage);

        const tag = getDockerTag(f.tag);
        if (tag === config.defaults.tag) {
            this.warn(`${f.name} does not have a tag. Adding ${tag} for now, but this might cause issues while deploying...`);
        }

        if (!f.skipBuild) {
            const command = new Command(`docker build . -f ${f.handler} -t ${this.serverless.service.provider.docker.imageUser}/${f.name}:${tag}`, join(process.cwd(), f.context));
            command.setSilent(true);
            const result = await command.run();
            this.log(result.stdout);
            if (result.stderr) {
                this.log(result.stderr);
            }
        } else {
            this.log(`Skipping build for ${f.name}`);
        }

        if(p) {
            const command = new Command(`docker push ${this.serverless.service.provider.docker.imageUser}/${f.name}:${tag}`);
            command.setSilent(true);
            const result = await command.run();
            this.log(result.stdout);
            if (result.stderr) {
                this.log(result.stderr);
            }
        } else {
            this.warn(`Not pushing ${f.name} to a container registry`);
        }
    }
}