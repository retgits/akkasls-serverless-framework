# Akka Serverless Provider Plugin for Serverless Framework

> Provider plugin for the [Serverless Framework](https://serverless.com) v2.x which adds support for [Akka Serverless](https://akkaserverless.com).

## Prerequisites

The Akka Serverless Provider Plugin for Serverless Framework may need to invoke the following command line tools, depending on which features you use. You will need `akkasls` at minimum, and `docker` if you plan to use the extension to build applications.

To use this plugin, you'll have to install it first:

```bash
npm install --save-dev @retgits/akkasls-serverless-framework
```

After that, you can add `@retgits/akkasls-serverless-framework` to your plugins (see the below template as an example).

## Template

```yaml
## You can pin your service to only deploy with a specific Serverless version
## Check out the Serverless docs for more details
frameworkVersion: '2'

## The service name can be anything you want, it will be ignored by the Akka Serverless provider.
## Since this is a mandatory field for the Serverless Framework, it's recommended to set the value
## of this field to the name of the project you want to deploy to and use a reference variable for
## the `project` property.
service: myproject

## Starting with Serverless Framework v3.0.0, environment variables will be automatically loaded from .env and .env.{stage} 
## files if they're present. In addition, .env files will be excluded from package in order to avoid 
## uploading sensitive data as a part of the package by mistake.
useDotenv: true

## Starting with v3.0.0, references to variables that cannot be resolved will result in an error being thrown.
## This setting adopts that behavior already.
unresolvedVariablesNotificationMode: error

## Starting with v3.0.0, Serverless will throw on configuration errors by default.
## This setting adopts that behavior already.
configValidationMode: error

## The configuration for the Akka Serverless provider
## These values control the settings of the 'akkasls' command line interface
provider:
  ## name of the provider, must be 'akkaserverless'
  name: akkaserverless
  ## location of config file (default "~/.akkaserverless/config.yaml")
  config: '~/.akkaserverless/config.yaml'
  ## configuration context to use
  context: 'default'
  ## set quiet output (helpful when used as part of a script)
  quiet: false
  ## client command timeout (default 10s)
  timeout: 10s
  ## The log level to use, can be error, warn, info, or debug
  loglevel: debug

## The Akka Serverless project you want to deploy to
akkaserverless:
  ## The name of the project you want to deploy to
  project: ${self:service}
  ## Optional Google Cloud Pub/Sub configuration
  broker:
    ## Location of the Google Cloud Pub/Sub key file
    keyFile: ./mykey.json
  ## Optional Google Cloud Operations Suite configuration
  logAggregator:
    ## Location of the Google Cloud Operations Suite key file
    keyFile: ./mykey.json  
  ## Optional container registry credentials
  registries:
      ## The URL of the registry
    - registryUrl: docker.io
      ## Optional email address to connect to the registry
      email: email@example.com
      ## Optional username to connect to the registry
      username: myname
      ## Optional password to connect to the registry
      password: s3cr3t

## The services you want to deploy to Akka Serverless
services:
  ## Name of the service
  warehouse:
    ## The dockerfile to use for docker build
    dockerfile: hello-world.dockerfile
    ## The folder, relative to this file, where the code is located
    folder: ./code
    ## The full image name for the container to use
    imagename: docker.io/akkaserverless/warehouse
    ## An optional tag to add to the container
    tag: '1.0.0'
    ## Skips the build if set to true
    skipBuild: true
    ## When running locally this controls the port on which the Akka Serverless proxy will listen
    proxyPort: 9091
    ## Environment variables that you want to set
    environment:
      hello: world
      msg: the warehouse is stocked

plugins:
  - '@retgits/akkasls-serverless-framework'
```

## Commands

| Name                                        | Description                                                               |
|---------------------------------------------|---------------------------------------------------------------------------|
| [akkasls](./docs/akkasls.md)                | Download the latest version of the Akka Serverless Command Line Interface |
| [aslogin](./docs/authenticate.md)           | Login to Akka Serverless                                                  |
| [aslogout](./docs/authenticate.md)          | Logout from Akka Serverless                                               |
| [set-registries](./docs/resources.md)       | Set your container registries to the ones supplied in serverless.yml      |
| [unset-registries](./docs/resources.md)     | Remove all container registries                                           |
| [set-broker](./docs/resources.md)           | Set the messaging broker for the project                                  |
| [unset-broker](./docs/resources.md)         | Unset the messaging broker for the project                                |
| [set-log-aggregator](./docs/resources.md)   | Set the log aggregator for the project                                    |
| [unset-log-aggregator](./docs/resources.md) | Unset the log aggregator for the project                                  |
| [set-all](./docs/resources.md)              | Set the log aggregator and broker for the project                         |
| [unset-all](./docs/resources.md)            | Unset the log aggregator and broker for the project                       |
| [package](./docs/services.md)               | Package services into containers                                          |
| [asdeploy](./docs/services.md)              | Deploy services to Akka Serverless                                        |
| [remove](./docs/services.md)                | Remove services from Akka Serverless                                      |
| [aslogs](./docs/services.md)                | Get the latest logs of a service                                          |
| [local](./docs/services.md)                 | Start or stop a service running locally                                   |

## Release notes

See the [changelog](./CHANGELOG.md)

## License

See the [LICENSE](./LICENSE)
