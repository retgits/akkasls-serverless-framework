import Serverless from 'serverless';
import { BasePlugin } from '../basePlugin';
import { platform, homedir } from 'os';
import { join } from 'path';
import { exec, which, ShellString } from 'shelljs';

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
                this._downloadAkkaSlsUnix(platform(), exists.stdout);
                break;
            case 'linux':
                this._downloadAkkaSlsUnix(platform(), exists.stdout);
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
    private _downloadAkkaSlsUnix(os: string, location?: string): void {
        // TODO: Once Akka Serverless supports Apple M1 chips, update this call to support that too using `process.arch`
        let result = run(`curl -OL https://downloads.akkaserverless.com/stable/akkasls_${os}_amd64.tar.gz`, join(homedir(), 'Downloads'));

        if (result.code !== 0) {
            this.error('Failed to download the Akka Serverless CLI...');
            return;
        }

        result = run(`tar xzf akkasls_${os}_amd64.tar.gz`, join(homedir(), 'Downloads'));

        if (result.code !== 0) {
            this.error('Unable to extract the Akka Serverless CLI...');
            return;
        }

        if (location) {
            this.warn(`Downloaded the Akka Serverless CLI to ${join(homedir(), 'Downloads')}. You have to move it to your PATH to use it`);
            return;
        }

        result = run(`mv akkasls ${location}`, join(homedir(), 'Downloads'));
        if (result.code !== 0) {
            this.error('Unable to override the existing Akka Serverless CLI...');
            return;
        }
    }
}

/**
 * Executes the given command synchronously.
 *
 * @param {string} command The command to execute
 * @param {string} workingDir The directory to execute the command in
 * @return {*}  {ShellString} The response from the command
 */
function run(command: string, workingDir: string): ShellString {
    return exec(command, {
        env: process.env,
        async: false,
        cwd: workingDir
    });
}