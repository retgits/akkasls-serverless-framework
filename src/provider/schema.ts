export const providerSchema = {
    provider: {
        properties: {
            config: {
                type: 'string',
            },
            context: {
                type: 'string',
            },
            quiet: {
                type: 'boolean',
            },
            timeout: {
                type: 'string',
            },
            loglevel: {
                type: 'string',
            }
        }
    }
};

export const akkaserverlessSchema = {
    akkaserverless: {
        properties: {
            project: {
                type: 'string',
            },
            broker: {
                type: 'object',
                properties: {
                    keyFile: {
                        type: 'string',
                    }
                }
            },
            logAggregator: {
                type: 'object',
                properties: {
                    keyFile: {
                        type: 'string',
                    }
                }
            },
            registries: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        registryUrl: {
                            type: 'string',
                        }, 
                        email: {
                            type: 'string',
                        }, 
                        password: {
                            type: 'string',
                        }, 
                        username: {
                            type: 'string',
                        }
                    }
                }
            }
        }
    }
};

const functionNamePattern = '^[a-zA-Z0-9-_]+$';

export const servicesSchema = {
    services: {
        type: 'object',
        patternProperties: {
            [functionNamePattern]: {
                type: 'object',
            }
        }
    }
};