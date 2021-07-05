# Services

## Package

The package command builds all containers and optionally pushes them to a container registry as well. You can specify a single single service with the `--service` option.

### Usage

Package all services as containers

```bash
serverless package
```

Package the `warehouse` service and push it to a container registry

```bash
serverless package --service warehouse --push
```

### Options

* `--service` Name of service to package
* `--push` Push packaged container(s) to the container registry

## Deploy

The `asdeploy` command deploys your entire project to Akka Serverless. Run this command when you have made any changes (i.e., you edited serverless.yml). Use `serverless asdeploy --service warehouse` when you have made code changes and you want to quickly upload your updated code to Akka Serverless.

### Usage

Deploy your entire project

```bash
serverless asdeploy
```

Deploy only the warehouse service

```bash
serverless asdeploy --service warehouse
```

Deploy the warehouse service and expose it over HTTP

```bash
serverless asdeploy --service warehouse --expose
```

### Options

* `--service` Name of service to package
* `--expose` When set, adds an HTTP endpoint to your service
* `--dryrun` When set, only prints the commands without execution.

## Remove

The remove command will remove services from the Akka Serverless project.

### Usage

Remove all services from a project

```bash
serverless remove
```

Remove only the warehouse service

```bash
serverless remove --service warehouse
```

### Options

* `--dryrun` or `-d` When set, only prints the commands without execution.

## Logs

The `aslogs` commands retrieves the logs for a specific service from Akka Serverless

### Usage

Get the logs from the warehouse service

```bash
serverless aslogs --service warehouse
```

### Options

* `--dryrun` or `-d` When set, only prints the commands without execution.

## Local

The `local` command lets you run services locally. When you select a service, a new docker bridge network is created where the service and a proxy are started. The proxy server is exposed on the port you specify with `proxyPort` in your `serverless.yml`.

### Usage

Run the warehouse service locally

```bash
serverless local --command start --service warehouse
```

Stop the warehouse service running locally

```bash
serverless local --command stop --service warehouse
```
