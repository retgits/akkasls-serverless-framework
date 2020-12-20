/**
 * The sls remove command will remove the deployed service, defined in your current working directory, from the provider.
 */
import Serverless from 'serverless';
import { BasePlugin } from '../basePlugin';
import { Provider } from '../../datatypes';
import { Credential, deleteDockerCredentials, listDockerCredentials, listServices, Service, undeployService } from '@retgits/akkasls-nodewrapper';

export class ASRemovePlugin extends BasePlugin {
    private _provider: Provider;

    public constructor(serverless: Serverless, options: Serverless.Options) {
        super(serverless, options);

        delete this.serverless.pluginManager.hooks['remove:remove'];

        // Add hooks
        this.hooks = {
            'remove:remove': this._remove.bind(this),
        };

        // Add commands
        this.commands = {
            remove: {
                usage: 'Remove Akka Serverless services and all resources',
                lifecycleEvents: [
                    'remove'
                ],
                options: {
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
    }

    private async _remove() {
        // The conversion of type 'string' (which is the result from getOption) to type 'boolean' tricks the compiler in thinking there might be no overlap. 
        // That's why the expression is converted to 'unknown' first.
        const dryrun = this.getOption('dryrun', false) as unknown as boolean;

        const project: string = this.serverless.service.getServiceName();
        const services = await listServices(project, {dryrun: false, silent: true, configFile: this._provider.config, context: this._provider.context});
        const credentials = await listDockerCredentials(project, {dryrun: false, silent: true, configFile: this._provider.config, context: this._provider.context});

        const svcs = services.response as Service[];
        const creds = credentials.response as Credential[];

        svcs.forEach(async (svc) => {
            const res = await undeployService(svc.metadata.name, project, {dryrun: dryrun, silent: true, configFile: this._provider.config, context: this._provider.context});
            this.log(res.stdout);
        });

        creds.forEach(async (cred) => {
            const name = cred.name.split('/').pop();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const res = await deleteDockerCredentials(project, name!, {dryrun: dryrun, silent: true, configFile: this._provider.config, context: this._provider.context});
            this.log(res.stdout);
        });
    }
}