import Serverless from 'serverless';
import { BasePlugin } from './base';
import { platform } from 'os';
import { exec, which } from 'shelljs';

export class AkkaServerlessCliPlugin extends BasePlugin {
    public constructor(serverless: Serverless, options: Serverless.Options) {
        super(serverless, options);

        // Add commands
        this.commands = {
            akkasls: {
                usage: 'Download the latest version of the Akka Serverless Command Line Interface',
                lifecycleEvents: ['download'],
                options: {
                    force: {
                        required: false,
                        usage: 'Force download even if there is an existing version of akkasls',
                        type: 'boolean'
                    }
                }
            }
        };

        // Add hooks
        this.hooks = {
            'akkasls:download': this._executeDownload.bind(this),
        };
    }

    private async _executeDownload(): Promise<void> {
        // Check if akkasls is already present
        const exists = which('akkasls');

        // If akkasls already exists and the force download flag is not specified don't download it again
        if (exists !== null && !this.options.force) {
            this.info('The Akka Serverless CLI already exists on this machine, specify --force if you want to download it again');
            return;
        }

        switch (platform()) {
            case 'darwin':
                this._downloadAkkaSlsUnix();
                break;
            case 'linux':
                this._downloadAkkaSlsUnix();
                break;
            default:
                this.error(`No automated support has been added to install the Akka Serverless CLI on ${platform()}`);
                break;
        }

        console.log(exists.stdout);
        return;
    }

    /**
     * Download the Akka Serverless CLI on unix based systems
     *
     * @param {string} type The type of OS (valid values are darwin and linux)
     * @param {string} [location] The location to move the CLI to if it already exists
     */
    private _downloadAkkaSlsUnix(): void {
        const result = exec('curl -sL https://developer.lightbend.com/docs/akka-serverless/get.sh | bash', {
            env: process.env,
            async: false,
        });

        if (result.code !== 0) {
            this.error('Failed to download the Akka Serverless CLI...');
            return;
        }
    }
}