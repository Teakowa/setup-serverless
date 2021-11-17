# setup-serverless

![Build Test](https://github.com/Teakowa/setup-serverless/workflows/Build%20Test/badge.svg)
![Setup Serverless](https://github.com/Teakowa/setup-serverless/workflows/Setup%20Serverless/badge.svg)
[![LICENSE](https://img.shields.io/badge/License-Apache--2.0-green.svg?style=flat-square)](LICENSE)
[![LICENSE](https://img.shields.io/badge/License-Anti%20996-blue.svg?style=flat-square)](https://github.com/996icu/996.ICU/blob/master/LICENSE)
[![996.icu](https://img.shields.io/badge/Link-996.icu-red.svg?style=flat-square)](https://996.icu)

The `Teakowa/setup-serverless` action is a JavaScript action that sets up Serverless CLI  in your GitHub Actions workflow by:

- Install a specific version of Serverless CLI

After you've used the action, subsequent steps in the same job can run arbitrary Serverless commands using [the GitHub Actions run syntax](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idstepsrun). This allows most Serverless commands to work exactly like they do on your local command line.

## Support Providers

- [AWS](#aws)
- [Azure](#azure)
- [Tencent](#tencent-cloud)
- knative
- [Alibaba Cloud](#aliyun)
- cloudflare workers
- fn
- kubeless
- openwhisk

## Usage

This action can be run on `ubuntu-latest` and `macos-latest` GitHub Actions runners.

The default configuration installs the latest version of Serverless CLI

```yaml
steps:
- uses: Teakowa/setup-serverless@v2.0.0
```

A specific version of Serverless CLI can be installed.

```yaml
steps:
- uses: Teakowa/setup-serverless@v2.0.0
  with:
    serverless_version: 2.4.0
```

### AWS

Credentials for AWS can be configured.

```yaml
steps:
- uses: Teakowa/setup-serverless@v2.0.0
  with:
    provider: aws
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY}}

- run: sls deploy
```

### Azure

Credentials for Azure can be configured.

```yaml
steps:
- uses: Teakowa/setup-serverless@v2.0.0
  with:
    provider: azure
  env:
    AZURE_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
    AZURE_TENANT_ID: ${{ secrets.AZURE_TENANT_ID}}
    AZURE_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID}}
    AZURE_CLIENT_SECRET: ${{ secrets.AZURE_CLIENT_SECRET}}

- run: sls deploy
```

### Tencent Cloud

Credentials for Tencent Cloud can be configured.

```yaml
steps:
- uses: Teakowa/setup-serverless@v2.0.0
  with:
    provider: tencent
  env:
    TENCENT_APPID: ${{ secrets.TENCENT_APP_ID }}
    TENCENT_SECRET_ID: ${{ secrets.TENCENT_SECRET_ID }}
    TENCENT_SECRET_KEY: ${{ secrets.TENCENT_SECRET_KEY}}

- run: sls deploy
```

> **If you need to use Tencent Cloud in China, you need to set the environment variable SERVERLESS_PLATFORM_VENDOR to tencent.**
> 
> **You don't need TENCENT_TOKEN, because it is not currently supported.**

```yaml
steps:
- uses: Teakowa/setup-serverless@v2.0.0
  with:
    provider: tencent
  env:
    TENCENT_APPID: ${{ secrets.TENCENT_APP_ID }}
    TENCENT_SECRET_ID: ${{ secrets.TENCENT_SECRET_ID }}
    TENCENT_SECRET_KEY: ${{ secrets.TENCENT_SECRET_KEY}}
    SERVERLESS_PLATFORM_VENDOR: tencent # Must be set here to use in China

- run: sls deploy
```

### Aliyun

Credentials for Aliyun can be configured.

```yaml
steps:
- uses: Teakowa/setup-serverless@v2.0.0
  with:
    provider: aliyun
  env:
    ALICLOUD_ACCOUNT_ID: ${{ secrets.ALICLOUD_ACCOUNT_ID }}
    ALICLOUD_ACCESS_KEY: ${{ secrets.ALICLOUD_ACCESS_KEY }}
    ALICLOUD_SECRET_KEY: ${{ secrets.ALICLOUD_SECRET_KEY}}

- run: sls deploy
```

## Inputs

The action supports the following inputs:

- `serverless_version`: (optional) The version of Serverless CLI to install. Instead of a full version string, you can also specify a constraint string (see [Advanced Range Syntax](https://www.npmjs.com/package/semver#advanced-range-syntax) for available range specifications). Examples are: ^2.4, ~2.4, 2.4.x (all three installing the latest available 2.4 version). The special value of latest installs the latest version of Serverless CLI. Defaults to latest.
- `provider`: (**required**) The infrastructure provider of serverless framework. All characters must be lowercase.

## Contributing
Contributions, issues and feature requests are welcome!
Feel free to check [issues page](https://github.com/Teakowa/setup-serverless/issues).



## License

The code in this repository, unless otherwise noted, is under the terms of both the [Anti 996](./LICENSE-ANTI996) License and the [Apache License (Version 2.0)](./LICENSE-APACHE).
