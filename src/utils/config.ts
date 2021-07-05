export const config = {
    providerName: 'akkaserverless',
    /**
     * The commands that are available to the Serverless Framework provider
     */
    commands: {
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
    }
};