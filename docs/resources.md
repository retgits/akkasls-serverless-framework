# Project resources

## Add registry credentials

Akka Serverless uses container images to deploy your services. The `set-registries` command sets the container registries for your project to the ones supplied in `serverless.yml`. This is a destructive operation, all existing registries will be removed from your project first before this command is executed.

### Usage

```
serverless set-registries
```

Below is an example of a YAML snippet that will create a credential registry for `docker.io` in `myproject`. The `registries` element is an array, so you can have more than one.

```yaml
akkaserverless:
  project: myproject
  registries:
    - registryUrl: docker.io
      email: email@example.com
      username: myname
      password: s3cr3t
```

### Options

* `--dryrun` When set, only prints the commands without execution.

## Remove registry credentials

Akka Serverless uses container images to deploy your services. The `unset-registries` command removes all existing registried from your project.

### Usage

```
serverless unset-registries
```

### Options

* `--dryrun` When set, only prints the commands without execution.

## Add a message broker

To have your Akka Serverless services communicate with each other or connect them to a wide variety of other services, you can use a message broker. The `set-broker` command will add a broker to your project.

### Usage

```bash
serverless set-broker
```

If you want to add a log-aggregator too, you can run

```bash
serverless set-all
```

Below is an example of a YAML snippet that will add a Google Cloud Pub/Sub message broker to `myproject`.

```yaml
akkaserverless:
  project: myproject
  broker:
    keyFile: ./mykey.json
```

### Options

* `--dryrun` When set, only prints the commands without execution.

## Remove a message broker

To have your Akka Serverless services communicate with each other or connect them to a wide variety of other services, you can use a message broker. The `unset-broker` command will remove a broker from your project.

### Usage

```bash
serverless unset-broker
```

If you want to remove a log-aggregator too, you can run

```bash
serverless unset-all
```

### Options

* `--dryrun` When set, only prints the commands without execution.

## Add a log aggregator

To have your Akka Serverless send all your logs to a log aggregator you're already using for other services (like Google Cloud Operations Suite (formerly Stackdriver)). The `set-log-aggregator` command will add a log aggregator to your project.

### Usage

```bash
serverless set-log-aggregator
```

If you want to add a message broker too, you can run

```bash
serverless set-all
```

Below is an example of a YAML snippet that will add a Google Cloud Operations Suite log aggregator to `myproject`.

```yaml
akkaserverless:
  project: myproject
  logAggregator:
    keyFile: ./mykey.json
```

### Options

* `--dryrun` When set, only prints the commands without execution.

## Remove a log aggregator

To have your Akka Serverless send all your logs to a log aggregator you're already using for other services (like Google Cloud Operations Suite (formerly Stackdriver)). The `unset-log-aggregator` command will remove a log aggregator to your project.

### Usage

```bash
serverless unset-log-aggregator
```

If you want to remove a message too, you can run

```bash
serverless unset-all
```

### Options

* `--dryrun` When set, only prints the commands without execution.