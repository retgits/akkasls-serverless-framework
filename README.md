# Akka Serverless Plugin for Serverless Framework

> Provider plugin for the [Serverless Framework](https://serverless.com) v2.x which adds support for [Akka Serverless](https://docs.cloudstate.com).

![image](image.png)

*[Illustration by Freepik Stories](https://stories.freepik.com/technology)*

## Prerequisites

The Akka Serverless Plugin for Serverless Framework may need to invoke the following command line tools, depending on which features you use. You will need `akkasls` at minimum, and `docker` if you plan to use the extension to build applications.

To use this plugin, you'll have to install it first:

```bash
npm install --save-dev @retgits/akkasls-serverless-framework
```

After that, you can add `@retgits/akkasls-serverless-framework` to your plugins (see the below template as an example).

## Template

```yaml
# You can pin your service to only deploy with a specific Serverless version
# Check out the Serverless docs for more details
frameworkVersion: '2'

custom:
  username: helloworld

## The name of the project on Akka Serverless you want to deploy to
service: acme-sunglasses

## The configuration for the Akka Serverless provider
provider:
  name: akkaserverless                    ## name of the provider, must be 'akkaserverless'
  config: '~/.akkaserverless/config.yaml' ## location of config file (default "~/.akkaserverless/config.yaml")
  context: 'default'                      ## configuration context to use
  quiet: false                            ## set quiet output (helpful when used as part of a script)
  timeout: 10s                            ## client command timeout (default 10s)
  docker:                                 ## docker configuration
    imageUser: docker.io/retgits          ## image prefix for docker images
    credentials:                          ## docker credentials to add (multiple of these can exist)
      - server: docker.io                 ## the docker server
        email: my@email.com               ## the docker email adress
        username: ${self:custom.username} ## the docker username
        password: s3cr3t                  ## the docker password
        recreate: true                    ## delete and recreate the credentials for this server, if they already exist on Akka Serverless for this project

## Functions are the user containers that you want to deploy
functions:
  warehouse:                        ## name of the service
    handler: hello-world.dockerfile ## dockerfile to use for docker build
    context: ./code                 ## folder, relative to this file, where the code is located
    tag: '1.0.0'                    ## tag to add to the docker container
    skipBuild: true                 ## skips the build if set to true
    proxyHostPort: 9001
    environment:                    ## environment variables that you want to set
      hello: world
      msg: the warehouse is stocked

plugins:
  - '@retgits/akkasls-serverless-framework'
```

## Commands

### Login

The `aslogin` command logs users into Akka Serverless. You'll be provided with the opportunity to create a new account if one doesn't exist already.

```bash
serverless aslogin
```


### Logs

The `aslogs` commands retrieves the logs for a specific function from Akka Serverless

#### Usage

Get the logs from the warehouse function

```bash
serverless aslogs -f warehouse
```

### Remove

The remove command will remove all services and docker credentials from the Akka Serverless project.

#### Usage

```bash
serverless remove
```

#### Options

* `--dryrun` or `-d` When set, only prints the commands without execution.

### Package

The package command builds all containers and optionally pushes them to a container registry as well. You can specify a single single container with the -f option.

#### Usage

Package all services as containers

```bash
serverless package
```

Package the `warehouse` service and push it to a container registry

```bash
serverless package --name warehouse --push
```

#### Options

* `--function` or `-f` Name of function to package
* `--push` Push packaged container(s) to the container registry

### Deploy

The `asdeploy` command deploys your entire project to Akka Serverless. Run this command when you have made any changes (i.e., you edited serverless.yml). Use `serverless asdeploy -f warehouse` when you have made code changes and you want to quickly upload your updated code to Akka Serverless.

Running the deployment command without a specific function will synchronize the current configuration (your serverless.yml file) with Akka Serverless. That means any docker  credentials or functions that are deployed but not listed in your configuration will be  removed.

#### Usage

Deploy your entire project

```bash
serverless asdeploy
```

Deploy only the warehouse function

```bash
serverless asdeploy -f warehouse
```

#### Options

* `--function` or `-f` Name of function to package
* `--dryrun` or `-d` When set, only prints the commands without execution.

### Local

The `local` command lets you run services locally.

#### Start

The `local start` command lets you choose a service to spin up locally. With the parameter `--function / -f` you can choose which service will be started. When you select a service, a new docker bridge network is created where the service and a proxy are started. The proxy server is exposed on the port you specify with `proxyHostPort` in your `serverless.yml`.

```bash
serverless local start -f warehouse
```

#### Stop

The `local stop` command lets you choose a service to stop running locally. With the parameter `--function / -f` you can choose which service will be started. When you select a service, the docker containers for the service and proxy are stopped and the docker bridge network is removed.

```bash
serverless local stop -f warehouse
```

### Create

Creates a new service in the current working directory based on the provided template.  Check out [akkasls-templates](https://github.com/retgits/akkasls-templates) for available templates.

#### Usage

Create service in current working directory:

```bash
serverless create --template-url https://github.com/retgits/akkasls-templates/tree/main/nodejs/helloworld
```

Create service in new folder using a custom template:

```bash
serverless create --template-url https://github.com/retgits/akkasls-templates/tree/main/nodejs/helloworld --path myService
```

#### Options

* `--template-url` or `-u` A URL pointing to a template.
* `--path` or `-p` The path where the service should be created.
* `--name` or `-n` the name of the service in serverless.yml.

### Install

Installs a service from a GitHub URL in the current working directory. Check out [akkasls-templates](https://github.com/retgits/akkasls-templates) for available templates.

#### Usage

```bash
serverless install --url https://github.com/retgits/akkasls-templates/tree/main/nodejs/helloworld
```

Installing a service from a GitHub URL

```bash
serverless install --url https://github.com/retgits/akkasls-templates/tree/main/nodejs/helloworld
```

This example will download the .zip file of the `helloworld-sls` service from GitHub, create a new directory with the name `helloworld-sls` in the current working directory and unzips the files in this directory.

Installing a service from a GitHub URL with a new service name

```bash
serverless install --url https://github.com/retgits/akkasls-templates/tree/main/nodejs/helloworld --name my-helloworld
```

This example will download the .zip file of the `helloworld-sls` service from GitHub, create a new directory with the name `my-helloworld` in the current working directory and unzips the files in this directory and renames the service to `my-helloworld` if `serverless.yml` exists in the service root.

#### Options

* `--url` or `-u` The services Git URL.
* `--name` or `-n` Name for the service.

### Print

Print your `serverless.yml` config file with all variables resolved.

#### Usage

With this command, it will print the fully-resolved config to your console.

```bash
serverless print
```

Assuming you have the following config file:

```yaml
custom:
  username: helloworld
  password: ${env:SHELL}

service: acme-sunglasses

provider:
  name: akkaserverless
  timeout: 10s
  docker:
    imageUser: docker.io/retgits
    credentials:
      - server: docker.io
        email: my@email.com
        username: ${self:custom.username}
        password: s3cr3t
        recreate: true 
```

Using `sls print` will resolve the variables in provider.stage and BucketName.

```yaml
custom:
  username: helloworld
  password: /bin/bash ## <-- resolved

service: acme-sunglasses

provider:
  name: akkaserverless
  timeout: 10s
  docker:
    imageUser: docker.io/retgits
    credentials:
      - server: docker.io
        email: my@email.com
        username: helloworld ## <-- resolved
        password: s3cr3t
        recreate: true 
```

#### Options

* `format` Print configuration in given format ("yaml", "json", "text"). Default: yaml
* `path` Period-separated path to print a sub-value (eg: "provider.name")
* `transform` Transform-function to apply to the value (currently only "keys" is supported)


## Release notes

See the [changelog](./CHANGELOG.md)

## License

See the [LICENSE](./LICENSE)
