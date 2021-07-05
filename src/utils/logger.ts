import Serverless from 'serverless';
import { getFromObject } from './utils';

/**
 * Log Level in order from least verbose to most
 *
 * @export
 * @enum {number}
 */
export enum LogLevel {
    /** Only log error messages */
    ERROR = 1,
    /** Only log warnings and error messages */
    WARN = 2,
    /** Only log info, warnings and error messages */
    INFO = 3,
    /** Log everything */
    DEBUG = 4
}

/**
 * A logger class.
 *
 * @export
 * @class Logger
 */
export class Logger {
    /** 
     * Logging level for service. Specified by 'verbose' or 'v' flag in Serverless Options.
     * Defaults to 'info' 
     */
    private _logLevel: LogLevel;

    /**
     * Creates an instance of Logger.
     * 
     * @param {Serverless} _serverless The serverless instance enables access to global service config during runtime
     * @param {Serverless.Options} _options The objects instance are the options passed on from the command line and the serverless yaml file
     * @memberof Logger
     */
    public constructor(private _serverless: Serverless, private _options: Serverless.Options) {
        const defaultLogLevel = LogLevel.INFO;

        this._logLevel = getFromObject({
            'error': LogLevel.ERROR,
            'warn': LogLevel.WARN,
            'info': LogLevel.INFO,
            'debug': LogLevel.DEBUG,
            '': LogLevel.DEBUG
        }, _serverless.service.provider.loglevel, defaultLogLevel);
    }

    /**
     * Logs any message with a level (error, warn, info, debug) less than or equal
     * to the logging level set in the constructor (defaults to info)
     *
     * @param {string} message Message to log
     * @param {LogLevel} [logLevel=LogLevel.INFO] Log Level
     * @memberof Logger
     */
    public log(message: string, logLevel: LogLevel = LogLevel.INFO): void {
        if (logLevel <= this._logLevel) {
            this._serverless.cli.log(message);
        }
    }

    /**
     * Log an error message with prefix '[ERROR] '
     *
     * @param {string} message Error message
     * @memberof Logger
     */
    public error(message: string): void {
        this.log(`[ERROR] ${message}`, LogLevel.ERROR);
    }

    /**
     * Log a warning message with prefix '[WARN] '
     *
     * @param {string} message Warning message
     * @memberof Logger
     */
    public warn(message: string): void {
        this.log(`[WARN] ${message}`, LogLevel.WARN);
    }

    /**
     * Log an info message. Does not include any prefix, as info is default behavior
     *
     * @param {string} message
     * @memberof Logger Info message
     */
    public info(message: string): void {
        this.log(message, LogLevel.INFO);
    }

    /**
     * Log a debug message with prefix '[DEBUG] '
     *
     * @param {string} message
     * @memberof Logger Debug message
     */
    public debug(message: string): void {
        this.log(`[DEBUG] ${message}`, LogLevel.DEBUG);
    }
}