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