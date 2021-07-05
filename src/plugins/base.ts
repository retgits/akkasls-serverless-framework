import Serverless from 'serverless';
import { AkkaServerlessProviderConfig, AkkaServerlessConfig, ServerlessCommands, ServerlessHooks } from '../models/serverless';
import { LogLevel, Logger } from '../utils/logger';
import { getFromObject } from '../utils/utils';

/**
 * BasePlugin provides the base functionality for all plugins
 *
 * @export
 * @abstract
 * @class BasePlugin
 * @template TOptions Options from the Serverless Framework
 */
export abstract class BasePlugin<TOptions = Serverless.Options> {
    public hooks: ServerlessHooks;
    protected config: AkkaServerlessConfig;
    protected logger: Logger;
    protected commands: ServerlessCommands;
    protected provider: AkkaServerlessProviderConfig;

    /**
     * Creates an instance of BasePlugin.
     * 
     * @param {Serverless} serverless The serverless instance enables access to global service config during runtime
     * @param {TOptions} options The objects instance are the options passed on from the command line and the serverless yaml file
     * @memberof BasePlugin
     */
    public constructor(protected serverless: Serverless, protected options: TOptions) {
        this.hooks = {};
        this.commands = {};
        this.config = serverless.service as any;
        this.config.project = serverless.configurationInput.akkaserverless as any;
        this.logger = new Logger(serverless, options as any);
        this.provider = serverless.service.provider;
    }

    /**
     * Log message to Serverless CLI
     *
     * @protected
     * @param {string} message Message to log
     * @param {LogLevel} [logLevel] Loglevel to use
     * @memberof BasePlugin
     */
    protected log(message: string, logLevel?: LogLevel): void {
        this.logger.log(message, logLevel);
    }

    /**
     * Log error message to Serverless CLI
     *
     * @protected
     * @param {string} message Error message to log
     * @memberof BasePlugin
     */
    protected error(message: string): void {
        this.logger.error(message);
    }

    /**
     * Log warning message to Serverless CLI
     *
     * @protected
     * @param {string} message Warning message to log
     * @memberof BasePlugin
     */
    protected warn(message: string): void {
        this.logger.warn(message);
    }

    /**
     * Log info message to Serverless CLI
     *
     * @protected
     * @param {string} message Info message to log
     * @memberof BasePlugin
     */
    protected info(message: string): void {
        this.logger.info(message);
    }

    /**
     * Log debug message to Serverless CLI
     *
     * @protected
     * @param {string} message Debug message to log
     * @memberof BasePlugin
     */
    protected debug(message: string): void {
        this.logger.debug(message);
    }

    /**
     * Log a JSON based message and format it properly
     *
     * @protected
     * @param {*} object The object to pretty print
     * @memberof BasePlugin
     */
    protected prettyPrint(object: any): void {
        this.log(this.stringify(object));
    }

    /**
     * Converts an object to a string with spaces and linebreaks
     *
     * @protected
     * @param {*} object The object to convert
     * @return {*}  {string} The converted and formatted string
     * @memberof BasePlugin
     */
    protected stringify(object: any): string {
        return JSON.stringify(object, null, 2);
    }

    /**
     * Get the value of an option from the Options object or return the default value
     *
     * @protected
     * @param {string} key The key to search for in the options
     * @param {*} [defaultValue] The optional default value to return
     * @return {*}  {string} The value of the option
     * @memberof BasePlugin
     */
    protected getOption(key: string, defaultValue?: any): string {
        return getFromObject(this.options, key, defaultValue);
    }
}