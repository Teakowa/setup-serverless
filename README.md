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

- AWS
- Tencent
- Aliyun

# Usage

This action can be run on `ubuntu-latest` and `macos-latest` GitHub Actions runners.

The default configuration installs the latest version of Serverless CLI

```yaml
steps:
- uses: Teakowa/setup-serverless@v0
```

A specific version of Serverless CLI can be installed.

```yaml
steps:
- uses: Teakowa/setup-serverless@v0
  with:
    serverless_version: 2.4.0
```

Credentials for AWS can be configured.

```yaml
steps:
- uses: Teakowa/setup-serverless@v0
  with:
    provider: aws
    secret_id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    secret_key ${{ secrets.AWS_SECRET_ACCESS_KEY}}
```

Credentials for Tencent Cloud can be configured.

```yaml
steps:
- uses: Teakowa/setup-serverless@v0
  with:
    provider: tencent
    tencent_appid: ${{ secrets.TENCENTCLOUD_APP_ID }}
    secret_id: ${{ secrets.TENCENTCLOUD_SECRET_ID }}
    secret_key ${{ secrets.TENCENTCLOUD_SECRET_KEY}}
```

Credentials for Aliyun can be configured.

```yaml
steps:
- uses: Teakowa/setup-serverless@v0
  with:
    provider: aliyun
    aliyun_account_id: ${{ secrets.ALIYUN_ACCOUNT_ID }}
    secret_id: ${{ secrets.ALIYUN_ACCESS_KEY }}
    secret_key ${{ secrets.ALIYUN_SECRET_KEY}}
```

## Inputs

The action supports the following inputs:

- `serverless_version`: (optional) The version of Serverless CLI to install. Instead of a full version string, you can also specify a constraint string (see [Advanced Range Syntax](https://www.npmjs.com/package/semver#advanced-range-syntax) for available range specifications). Examples are: ^2.4, ~2.4, 2.4.x (all three installing the latest available 2.4 version). The special value of latest installs the latest version of Serverless CLI. Defaults to latest.
- `provider`: (**required**) The infrastructure provider of serverless framework. All characters must be lowercase.
- `secret_id`: (**required**) The secret id of infrastructure provider.
- `secret_key`: (**required**) The secret key of infrastructure provider.
- `tencent_appid`: (optional) The appid of tencent provider. when provider is tencent, it's required.
- `aliyun_account_id`: (optional) The account id of aliyun provider. when provider is aliyun, it's required.

## License

The code in this repository, unless otherwise noted, is under the terms of both the [Anti 996](./LICENSE-ANTI996) License and the [Apache License (Version 2.0)](./LICENSE-APACHE).