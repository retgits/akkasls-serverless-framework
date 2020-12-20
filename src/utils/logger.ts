import Serverless from 'serverless';
import { getFromObject } from './utils';

/**
 * Log Level in order from least verbose to most
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

export class Logger {
    /** 
     * Logging level for service. Specified by 'verbose' or 'v' flag in Serverless Options.
     * Defaults to 'info' 
     */
    private _logLevel: LogLevel;

    public constructor(private _serverless: Serverless, private _options: Serverless.Options) {
        const verbosity = getFromObject(_options, 'verbose');
        const defaultLogLevel = LogLevel.INFO;

        if (verbosity === true) {
            // --verbose flag is passed with no specified level
            this._logLevel = LogLevel.DEBUG;
        } else if (typeof verbosity === 'string') {
            // --verbose {level} is passed
            this._logLevel = getFromObject({
                'error': LogLevel.ERROR,
                'warn': LogLevel.WARN,
                'info': LogLevel.INFO,
                'debug': LogLevel.DEBUG,
                '': LogLevel.DEBUG
            }, verbosity.toLowerCase(), defaultLogLevel);
        } else {
            // --verbose not passed, use default
            this._logLevel = defaultLogLevel;
        }
    }

    /**
     * Logs any message with a level (error, warn, info, debug) less than or equal
     * to the logging level set in the constructor (defaults to info)
     * @param message Message to log
     * @param logLevel Log Level
     */
    public log(message: string, logLevel: LogLevel = LogLevel.INFO): void {
        if (logLevel <= this._logLevel) {
            this._serverless.cli.log(message);
        }
    }

    public error(message: string): void {
        this.log(`[ERROR] ${message}`, LogLevel.ERROR);
    }

    public warn(message: string): void {
        this.log(`[WARN] ${message}`, LogLevel.WARN);
    }

    public info(message: string): void {
        this.log(`[INFO] ${message}`, LogLevel.INFO);
    }

    public debug(message: string): void {
        this.log(`[DEBUG] ${message}`, LogLevel.DEBUG);
    }
}