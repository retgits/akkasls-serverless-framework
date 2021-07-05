/**
 * ServerlessHooks contains all hooks that the Serverless framework will respond to. A Hook binds 
 * code to any lifecycle event from any command like 'before:welcome:hello' or 'welcome:hello'.
 *
 * @export
 * @interface ServerlessHooks
 */
export interface ServerlessHooks {
    [eventName: string]: Promise<any>;
}

/**
 * AkkaServerlessConfig contains the data from the Serverless.service object
 *
 * @export
 * @interface AkkaServerlessConfig
 */
export interface AkkaServerlessConfig {
    service: string;
    provider: AkkaServerlessProviderConfig;
    project: AkkaServerlessProjectConfig;
    plugins: string[];
    services: AkkaServerlessService[];
}

/**
 * AkkaServerlessProviderConfig contains the data for the Serverless Framework provider
 *
 * @export
 * @interface AkkaServerlessProviderConfig
 */
export interface AkkaServerlessProviderConfig {
    name: string;
    config: string;
    context: string;
    quiet: boolean;
    stage: string;
    timeout: string;
    loglevel?: string;
}

/**
 * Akka Serverless project configuration
 *
 * @export
 * @interface AkkaServerlessProjectConfig
 */
export interface AkkaServerlessProjectConfig {
    project: string;
    broker: Broker;
    logAggregator: LogAggregator;
    registries: Registry[];
}

/**
 * Container registry configurations for Akka Serverless
 *
 * @export
 * @interface Registry
 */
export interface Registry {
    registryUrl: string;
    email?: string;
    username?: string;
    password?: string;
}

/**
 * Messaging broker configuration for Akka Serverless projects
 *
 * @export
 * @interface Broker
 */
export interface Broker {
    // The Google Cloud Platform key file
    keyFile: string;
}

/**
 * Log aggregator configuration for Akka Serverless projects
 *
 * @export
 * @interface LogAggregator
 */
export interface LogAggregator {
    // The Google Cloud Platform key file
    keyFile: string;
}

/**
 * ServerlessCommands contains all commands that the Serverless framework will respond to
 *
 * @export
 * @interface ServerlessCommands
 */
export interface ServerlessCommands {
    [command: string]: ServerlessCommand;
}

/**
 * A CLI Command that can be called by a user, e.g. serverless foo. A Command has no logic, but simply 
 * defines the CLI configuration (e.g. command, parameters) and the Lifecycle Events for the command. 
 * Every command defines its own lifecycle events.
 *
 * @export
 * @interface ServerlessCommand
 */
export interface ServerlessCommand {
    usage: string;
    lifecycleEvents: string[]; // Lifecycle events are emitted by the command
    options?: {
        [key: string]: {
            usage: string;
            shortcut?: string;
            required: boolean;
            type: string; // Accepted values are 'string', 'boolean', and 'multiple' (turning into a string array)
        };
    };
    commands?: ServerlessCommands;
}

export interface AkkaServerlessServices {
    [service: string]: AkkaServerlessService;
}

export interface AkkaServerlessService {
    name: string;
    dockerfile: string;
    folder: string;
    imagename: string;
    tag?: string;
    skipBuild: boolean;
    proxyPort: number;
    environment: {
        [key: string]: any;
    };
}