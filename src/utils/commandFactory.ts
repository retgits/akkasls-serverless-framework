import * as shell from 'shelljs';
import { AkkaServerlessCommandParameter ,ShellResult } from '../models/cli';

/**
 * The commands that are available to the Serverless Framework provider
 */
export const commands = {
    auth: {
        login: 'akkasls auth login --no-launch-browser',
        logout: 'akkasls auth logout',
    },
    projects: {
        resources: {
            setBroker: 'akkasls projects set broker',
            setLogAggregator: 'akkasls projects set log-aggregator',
            unsetBroker: 'akkasls projects unset broker',
            unsetLogAggregator: 'akkasls projects unset log-aggregator',
        },
        docker: {
            addDockerCredentials: 'akkasls docker add-credentials',
            deleteDockerCredentials: 'akkasls docker delete-credentials',
            listDockerCredentials: 'akkasls docker list-credentials -o json'
        },
        services: {
            deploy: 'akkasls services deploy',
            expose: 'akkasls services expose',
            delete: 'akkasls services undeploy',
            logs: 'akkasls services logs'
        }
    }
};

/**
 * A Command encapsulates the Akka Serverless CLI commands
 *
 * @export
 * @class Command
 */
export class Command {
    public readonly command: string;
    public readonly workingDir?: string;
    private _parameters: AkkaServerlessCommandParameter[] = [];
    private _silent = false;
    private _configFile = '';
    private _context = '';

    /**
     * Creates an instance of Command.
     * 
     * @param {string} command The command to execute
     * @param {string} [workingDir] The working directory for the command
     * @memberof Command
     */
    constructor(command: string, workingDir?: string) {
        this.command = command;
        this.workingDir = workingDir;
    }

    /**
     * Add a command line parameter to this command
     *
     * @param {AkkaServerlessCommandParameter} p The parameter to add
     * @memberof Command
     */
    addParameter(p: AkkaServerlessCommandParameter): void {
        this._parameters.push({
            name: p.name,
            value: p.value,
            addNameToCommand: p.addNameToCommand
        });
    }

    /**
     * Do not display any output (helpful when used as part of a script)
     *
     * @param {(boolean | undefined)} value The value to set
     * @memberof Command
     */
    setSilent(value: boolean | undefined): void {
        if (value) {
            this._silent = value;
        }
    }

    /**
     * Check whether or not to display output
     *
     * @return {*}  {boolean}
     * @memberof Command
     */
    isSilent(): boolean {
        return this._silent;
    }

    /**
     * Set the location of the config file to use
     *
     * @param {(string | undefined)} value The location of the config file
     * @memberof Command
     */
    setConfigFile(value: string | undefined): void {
        if (value) {
            this._configFile = value;
        }
    }

    /**
     * Set the configuration context to use
     *
     * @param {(string | undefined)} value The configuration context
     * @memberof Command
     */
    setContext(value: string | undefined): void {
        if (value) {
            this._context = value;
        }
    }

    /**
     * Returns a stringified version of the command to execute
     *
     * @return {*}  {string}
     * @memberof Command
     */
    toString(): string {
        let str = this.command;

        this._parameters.forEach((cmd) => {
            if (cmd.addNameToCommand) {
                str += ` --${cmd.name}`;
            }
            str += ` ${cmd.value}`;
        });

        if (this._configFile.length > 1) {
            str += ` --config ${this._configFile}`;
        }

        if (this._context.length > 1) {
            str += ` --context ${this._context}`;
        }

        return str;
    }

    /**
     * Returns the command to run as a string without running it (useful for debugging)
     *
     * @return {*}  {Promise<ShellResult>} `ShellResult` containing the command as stdout
     * @memberof Command
     */
    dryRun(): Promise<ShellResult> {
        return new Promise<ShellResult>((resolve) => {
            resolve({ code: 0, stdout: this.toString(), stderr: '' });
        });
    }

    /**
     * Executes the command
     *
     * @return {*}  {Promise<ShellResult>} `ShellResult`
     * @memberof Command
     */
    run(): Promise<ShellResult> {
        // When no working directory is provided the default dir is used
        const wd = (this.workingDir) ? this.workingDir : '.';

        const shellOpts = {
            env: process.env,
            async: false,
            cwd: wd,
            silent: this.isSilent()
        };

        const result = shell.exec(this.toString(), shellOpts) as shell.ShellString;
        
        return new Promise<ShellResult>((resolve) => {
            resolve({ code: result.code, stdout: result.stdout, stderr: result.stderr });
        });
    }
}