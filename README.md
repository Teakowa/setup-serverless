# setup-serverless

[![Continuous Integration](https://github.com/Teakowa/setup-serverless/actions/workflows/continuous-integration.yml/badge.svg)](https://github.com/Teakowa/setup-serverless/actions/workflows/continuous-integration.yml)
![Setup Serverless](https://github.com/Teakowa/setup-serverless/workflows/Setup%20Serverless/badge.svg)
[![all-contributors](https://img.shields.io/github/all-contributors/teakowa/setup-serverless/main?style=flat-square)](#contributors-)
[![LICENSE](https://img.shields.io/badge/License-Apache--2.0-green.svg?style=flat-square)](#LICENSE)
[![LICENSE](https://img.shields.io/badge/License-Anti%20996-blue.svg?style=flat-square)](https://github.com/996icu/996.ICU/blob/master/LICENSE)
[![996.icu](https://img.shields.io/badge/Link-996.icu-red.svg?style=flat-square)](https://996.icu)

This action provides the following functionality for GitHub Actions users:

- Optionally downloading and caching distribution of the requested standalone binary Serverless version(no node/npm required), and adding it to the PATH

After you've used the action, subsequent steps in the same job can run arbitrary Serverless commands using [the GitHub Actions run syntax](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idstepsrun). This allows most Serverless commands to work exactly like they do on your local command line.

## Usage

This action can be run on `ubuntu-latest` and `macos-latest` GitHub Actions runners.

The default configuration installs the latest version of Serverless CLI

**Basic:**

```yaml
steps:
  - uses: Teakowa/setup-serverless@v2
    with:
      serverless_version: 3.9.0
      provider: aws
    env:
      AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY}}

  - run: sls deploy
```

The `serverless_version` input is optional. If not supplied, the serverless version from the latest release will be used.

The action will first check the local cache for a semver match. If unable to find a specific version in the cache, the action will attempt to download a version of Serverless. It will pull `latest` versions from serverless-versions releases.

### Supported version syntax

The `serverless_version` input not yet support the Semantic Versioning Specification, We have plans to add this support, and welcome PR.

Examples:

- Specific versions: `2.71.0`, `3.9.0`
- Latest release: `latest`

`latest` always install to the [latest release version](https://github.com/serverless/serverless/releases).

## Support Providers

- [AWS](#aws)
- [Azure](#azure)
- [Tencent](#tencent-cloud)
- knative
- [Alibaba Cloud](#aliyun)
- [cloudflare workers](#cloudflare-workers)
- fn
- kubeless
- openwhisk

Some providers need to be configured with credentials files, and this process will be performed by the `provider` input, which will automatically generate the corresponding credentials file when the `provider` contains these providers.

### AWS

Credentials for AWS can be configured.

```yaml
steps:
- uses: Teakowa/setup-serverless@v2
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
- uses: Teakowa/setup-serverless@v2
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
- uses: Teakowa/setup-serverless@v2
  with:
    provider: tencent
  env:
    TENCENT_APPID: ${{ secrets.TENCENT_APP_ID }}
    TENCENT_SECRET_ID: ${{ secrets.TENCENT_SECRET_ID }}
    TENCENT_SECRET_KEY: ${{ secrets.TENCENT_SECRET_KEY}}

- run: sls deploy
```

> **If you need to use Tencent Cloud in China, you need to set the environment variable `SERVERLESS_PLATFORM_VENDOR` to tencent.**
>
> **You don't need `TENCENT_TOKEN`, because it is not currently supported.**

```yaml
steps:
- uses: Teakowa/setup-serverless@v2
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
- uses: Teakowa/setup-serverless@v2
  with:
    provider: aliyun
  env:
    ALICLOUD_ACCOUNT_ID: ${{ secrets.ALICLOUD_ACCOUNT_ID }}
    ALICLOUD_ACCESS_KEY: ${{ secrets.ALICLOUD_ACCESS_KEY }}
    ALICLOUD_SECRET_KEY: ${{ secrets.ALICLOUD_SECRET_KEY}}

- run: sls deploy
```

### Cloudflare Workers

Credentials for Cloudflare Workers can be configured.

```yaml
steps:
- uses: Teakowa/setup-serverless@v2
  with:
    provider: cloudflare-workers
  env:
    CLOUDFLARE_AUTH_KEY: ${{ secrets.CLOUDFLARE_AUTH_KEY }}
    CLOUDFLARE_AUTH_EMAIL: ${{ secrets.CLOUDFLARE_AUTH_EMAIL }}

- name: Deploy
  run: |
    sls plugin install -n serverless-cloudflare-workers
    sls deploy
  env:
    CLOUDFLARE_AUTH_KEY: ${{ secrets.CLOUDFLARE_AUTH_KEY }}
    CLOUDFLARE_AUTH_EMAIL: ${{ secrets.CLOUDFLARE_AUTH_EMAIL }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    CLOUDFLARE_ZONE_ID: ${{ secrets.CLOUDFLARE_ZONE_ID }}
    CLOUDFLARE_WORKER_NAME: ${{ secrets.CLOUDFLARE_WORKER_NAME }}
```

## Inputs

The action supports the following inputs:

- `serverless_version`: (optional) The version of Serverless CLI to install.
- `provider`: (**required**) The infrastructure provider of serverless framework. All characters must be lowercase.

## Versioning

- Use the `v2` tag as `setup-serverless` version. It is a rolling tag and is synced with the latest minor and patch releases. With `v2` you automatically get the bug fixes, security patches, new features and support for latest `setup-serverless` releases.
- Semantic release versions can also be used. It is recommended to [use dependabot](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/keeping-your-actions-up-to-date-with-dependabot) with semantic versioning to keep the actions in your workflows up to date.

## Contributing
Contributions, issues and feature requests are welcome!
Feel free to check [issues page](https://github.com/Teakowa/setup-serverless/issues).

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://teakowa.me/"><img src="https://avatars.githubusercontent.com/u/27560638?v=4?s=100" width="100px;" alt="ƬΣΛKӨЩΛ"/><br /><sub><b>ƬΣΛKӨЩΛ</b></sub></a><br /><a href="https://github.com/Teakowa/setup-serverless/commits?author=Teakowa" title="Code">💻</a> <a href="https://github.com/Teakowa/setup-serverless/commits?author=Teakowa" title="Documentation">📖</a> <a href="#design-Teakowa" title="Design">🎨</a> <a href="#projectManagement-Teakowa" title="Project Management">📆</a></td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td align="center" size="13px" colspan="7">
        <img src="https://raw.githubusercontent.com/all-contributors/all-contributors-cli/1b8533af435da9854653492b1327a23a4dbd0a10/assets/logo-small.svg">
          <a href="https://all-contributors.js.org/docs/en/bot/usage">Add your contributions</a>
        </img>
      </td>
    </tr>
  </tfoot>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## License

The code in this repository, unless otherwise noted, is under the terms of both the [Anti 996](./LICENSE-ANTI996) License and the [Apache License (Version 2.0)](./LICENSE-APACHE).


<a href="https://trackgit.com">
<img src="https://us-central1-trackgit-analytics.cloudfunctions.net/token/ping/ldd800yy365z6w5gbsql" alt="trackgit-views" />
</a>