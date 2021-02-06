/**
 * The logs command gets the logs og the specified service
 */

import Serverless from 'serverless';
import { BasePlugin } from '../basePlugin';
import { Provider } from '../../datatypes';
import { getServiceLogs } from '@retgits/akkasls-nodewrapper';

export class ASLogPlugin extends BasePlugin {
    private _provider: Provider;
    private _dryrun: boolean;

    public constructor(serverless: Serverless, options: Serverless.Options) {
        super(serverless, options);

        // Add hooks
        this.hooks = {
            'aslogs:aslogs': this._logs.bind(this),
        };

        // Add commands
        this.commands = {
            aslogs: {
                usage: 'Get logs from Akka Serverless',
                lifecycleEvents: [
                    'aslogs'
                ],
                options: {
                    function: {
                        usage: 'Name of function to get logs from',
                        shortcut: 'f',
                        required: true,
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

    private async _logs() {
        const f = this.serverless.service.getFunction(this.options.function);
        const project: string = this.serverless.service.getServiceName();

        const res = await getServiceLogs(f.name, project, { dryrun: this._dryrun, silent: this._provider.quiet, configFile: this._provider.config, context: this._provider.context });
        this.log(res.stdout);
    }
}