/**
 * Provider contains the data for the Serverless Framework provider
 */
export interface Provider {
    name: string;
    config: string;
    context: string;
    quiet: boolean;
    stage: string;
    timeout: string;
    docker: Docker;
}

/**
 * Docker contains the docker configuration for the Akka Serverless provider
 */
export interface Docker {
    imageUser: string;
    credentials: DockerCredential[]
}

/**
 * Credential contains the docker credential configuration
 */
export interface DockerCredential {
    server: string;
    email: string;
    password: string;
    username: string;
    recreate: boolean;
}

/**
 * Function contains the data from Serverless.function object
 */
export interface Function {
    handler: string;
    context: string;
    events: string[];
    name: string;
    tag: string;
    proxyHostPort: number;
    skipBuild: boolean;
    environment?: {
        [key: string]: any;
    };
}

/**
 * Config contains the data from the Serverless.service object
 */
export interface Config {
    service: string;
    provider: Provider;
    plugins: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    functions: any;
}

/**
 * HookMap contains all events that the Serverless framework will respond to
 * like 'before:welcome:hello' or 'welcome:hello'
 */
export interface HookMap {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [eventName: string]: Promise<any>;
}

/**
 * Command are the commands that the Serverless Framework will respond to
 * like 'welcome'
 */
export interface Command {
    usage: string;
    lifecycleEvents: string[]; // Lifecycle events are emitted by the command
    options?: {
        [key: string]: {
            usage: string;
            shortcut?: string;
            required: boolean;
        };
    };
    commands?: CommandMap;
}

/**
 * CommandMap contains all commands that the Serverless framework will respond to
 * like 'before:welcome:hello' or 'welcome:hello'
 */
export interface CommandMap {
    [command: string]: Command;
}