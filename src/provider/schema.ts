export const validationSchema = {
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
            docker: {
                type: 'object',
                properties: {
                    imageUser: {
                        type: 'string',
                    },
                    credentials: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                server: {
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
                                },
                                recreate: {
                                    type: 'boolean',
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    function: {
        properties: {
            handler: {
                type: 'string'
            },
            context: {
                type: 'string'
            },
            tag: {
                type: 'string'
            },
            skipBuild: {
                type: 'boolean'
            },
            proxyHostPort: {
                type: 'number'
            }
        }
    }
};