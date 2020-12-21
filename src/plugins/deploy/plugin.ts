/**
 * The deploy command deploys your entire project to Akka Serverless. 
 * Run this command when you have made any changes (i.e., you edited serverless.yml). 
 * Use serverless deploy -f warehouse when you have made code changes and you want to 
 * quickly upload your updated code to Akka Serverless.
 * 
 * Running the deployment command without a specific function will synchronize the current
 * configuration (your serverless.yml file) with Akka Serverless. That means any docker 
 * credentials or functions that are deployed but not listed in your configuration will be 
 * removed.
 */

import Serverless from 'serverless';
import { BasePlugin } from '../basePlugin';
import { DockerCredential, Function, Provider } from '../../datatypes';
import { config } from "../../config";
import { getDockerTag, removeStageFromName } from '../../utils/utils';
import { addDockerCredentials, Credential, deleteDockerCredentials, deployService, listDockerCredentials, listServices, Service, undeployService } from '@retgits/akkasls-nodewrapper';

export class ASDeployPlugin extends BasePlugin {
    private _provider: Provider;
    private _dryrun: boolean;

    public constructor(serverless: Serverless, options: Serverless.Options) {
        super(serverless, options);

        // Add hooks
        this.hooks = {
            'asdeploy:asdeploy': this._deploy.bind(this),
        };

        // Add commands
        this.commands = {
            asdeploy: {
                usage: 'Deploy your project to Akka Serverless',
                lifecycleEvents: [
                    'asdeploy'
                ],
                options: {
                    function: {
                        usage: 'Name of function to deploy',
                        shortcut: 'f',
                        required: false,
                    },
                    dryrun: {
                        usage: 'When set, only prints the commands without execution',
                        required: false,
                        shortcut: 'd'
                    }
                }
            }
        };

        // Create a structured object from the provider
        this._provider = this.serverless.service.provider;

        // The conversion of type 'string' (which is the result from getOption) to type 'boolean' tricks the compiler in thinking there might be no overlap. 
        // That's why the expression is converted to 'unknown' first.
        this._dryrun = this.getOption('dryrun', false) as unknown as boolean;
    }

    private async _deploy() {
        const name = this.options.function;
        if (name) {
            const f = this.serverless.service.getFunction(name);
            await this._deployContainer(f);
        } else {
            this._sync();
        }
    }

    private async _sync() {
        const project: string = this.serverless.service.getServiceName();

        // Services that exist on Akka Serverless but do not exist in serverless.yml
        // will be undeployed. All other services will be deployed (for some this means
        // a redeployment).
        const services = await listServices(project, {dryrun: false, silent: true, configFile: this._provider.config, context: this._provider.context});
        const asServices = services.response as Service[];
        const slsServices =  this.serverless.service.getAllFunctions().map(f => `${project}-${f}`);

        const mustUndeploy = asServices.filter(svc => !slsServices.includes(svc));

        mustUndeploy.forEach(async (svc) => {
            const res = await undeployService(svc.metadata.name, project, {dryrun: this._dryrun, silent: this._provider.quiet, configFile: this._provider.config, context: this._provider.context});
            this.log(res.stdout);
        });

        this.serverless.service.getAllFunctions().map(async (func) => {
            const f = this.serverless.service.getFunction(func);
            await this._deployContainer(f);
        });

        // Credentials that exist on Akka Serverless but do not exist in serverless.yml
        // will be deleted. All other credentials will be recreated, unless the recreate
        // flag is set to false
        const credentials = await listDockerCredentials(project, {dryrun: false, silent: true, configFile: this._provider.config, context: this._provider.context});
        const asCreds = credentials.response as Credential[];
        const slsCreds = this._provider.docker.credentials;

        const mustRemove = asCreds.filter((cred) => {
            let notInSls = true;
            for(const slsCred of slsCreds) {
                if (cred.server === slsCred.server) {
                    notInSls = false;
                }
            }
            return notInSls;
        });

        const mustDeploy = slsCreds.filter((cred) => {
            let deploy = true;
            for(const asCred of asCreds) {
                if (cred.server === asCred.server && cred.recreate === false) {
                    deploy = false;
                } else if (cred.server === asCred.server && cred.recreate === true) {
                    mustRemove.push(asCred);
                }
            }
            return deploy;
        });

        mustRemove.forEach(async (cred) => {
            const name = cred.name.split('/').pop();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const res = await deleteDockerCredentials(project, name!, {dryrun: this._dryrun, silent: this._provider.quiet, configFile: this._provider.config, context: this._provider.context});
            this.log(res.stdout);
        });

        mustDeploy.forEach(async (cred) => {
            const res = await addDockerCredentials(project, this._credToString(cred), {dryrun: this._dryrun, silent: this._provider.quiet, configFile: this._provider.config, context: this._provider.context});
            this.log(res.stdout);
        });
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    private async _deployContainer(f: Function) {
        const project: string = this.serverless.service.getServiceName();

        f.name = removeStageFromName(f.name, this._provider.stage);

        const tag = getDockerTag(f.tag);
        if (tag === config.defaults.tag) {
            this.warn(`${f.name} does not have a tag. Adding ${tag} for now, but this might cause issues...`);
        }

        const res = await deployService(f.name, `${this.serverless.service.provider.docker.imageUser}/${f.name}:${tag}`, project, {dryrun: this._dryrun, silent: this._provider.quiet, configFile: this._provider.config, context: this._provider.context});
        this.log(res.stdout);
    }

    private _credToString(cred: DockerCredential): string {
        let str = '';

        if(cred.email) {
            str += ` --docker-email ${cred.email}`;
        }

        if(cred.password) {
            str += ` --docker-password ${cred.password}`;
        }

        if(cred.server) {
            str += ` --docker-server ${cred.server}`;
        }

        if(cred.username) {
            str += ` --docker-username ${cred.username}`;
        }

        return str;
    }
}