// Node.js core
import {writeFile} from 'fs';
import * as path from 'path';
import {promisify} from 'util';

// External
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as utils from './utils';

export async function run() {
  try {
    const version = core.getInput('serverless_version').toLowerCase();

    await utils.info(`Installing serverless version ${version} ...`);
    await install(version);
    await utils.info(`Installed serverless version ${version}`);

    const provider = core.getInput('provider');

    if (!provider) {
      await utils.fail('Missing required arguments');
    }

    await useProvider(provider);
    await utils.info(`Using provider ${provider}.`);
  } catch (error) {
    await utils.fail(error.message);
  }
}

async function install(version: string) {
  let output: string = '';
  let errOutput: string = '';

  const execOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
      stderr: (data: Buffer) => {
        errOutput += data.toString();
      }
    }
  };

  const serverless = `serverless@${version}`;
  await core.exportVariable('npm_config_loglevel', 'silent');
  await core.exportVariable('NPM_CONFIG_LOGLEVEL', 'silent');
  await exec.exec('sudo npm', ['install', '-g', serverless], execOptions);

  return {
    stdout: output,
    stderr: errOutput
  };
}

async function useProvider(provider: string) {
  switch (provider) {
    case 'aws': {
      if (
        !process.env['AWS_ACCESS_KEY_ID'] ||
        !process.env['AWS_SECRET_ACCESS_KEY']
      ) {
        await utils.fail(
          'Missing aws required environment variables: AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY'
        );
      }
      break;
    }

    case 'azure': {
      if (
        !process.env['AZURE_SUBSCRIPTION_ID'] ||
        !process.env['AZURE_TENANT_ID'] ||
        !process.env['AZURE_CLIENT_ID'] ||
        !process.env['AZURE_CLIENT_SECRET']
      ) {
        await utils.fail('Missing azure required environment variables.');
      }
      break;
    }

    case 'tencent': {
      const appid = process.env['TENCENT_APPID'];
      const secretId = process.env['TENCENT_SECRET_ID'];
      const secretKey = process.env['TENCENT_SECRET_KEY'];

      if (!appid || !secretId || !secretKey) {
        await utils.fail('Missing tencent required environment variables.');
      }

      const context = `[default]
tencent_appid = ${appid}
tencent_secret_id = ${secretId}
tencent_secret_key = ${secretKey}`.trim();

      await addCredentials(provider, 'credentials', context);

      if (process.env['SERVERLESS_PLATFORM_VENDOR'] === 'tencent') {
        const dotEnvContext = `TENCENT_SECRET_ID=${secretId}
TENCENT_SECRET_KEY=${secretKey}
SERVERLESS_PLATFORM_VENDOR=${provider}`.trim();
        await addDotEnv(dotEnvContext);
      }
      break;
    }

    case 'gcloud': {
      const keyfile =
        process.env['GCLOUD_KEYFILE'] !== undefined
          ? process.env['GCLOUD_KEYFILE']
          : '{}';

      if (!keyfile) {
        await utils.fail('Missing google cloud keyfile environment variables.');
      }

      await addCredentials(provider, 'keyfile.json', keyfile);

      break;
    }

    case 'cloudflare-workers': {
      if (
        !process.env['CLOUDFLARE_AUTH_KEY'] ||
        !process.env['CLOUDFLARE_AUTH_EMAIL']
      ) {
        await utils.fail('Missing cloudflare required environment variables.');
      }
      break;
    }

    case 'fn': {
      break;
    }

    case 'kubeless': {
      break;
    }

    case 'openwhisk': {
      if (!process.env['OW_AUTH'] || !process.env['OW_APIHOST']) {
        await utils.fail('Missing openwhisk required environment variables.');
      }
      break;
    }

    case 'aliyun': {
      const accountId = process.env['ALICLOUD_ACCOUNT_ID'];
      const accessKey = process.env['ALICLOUD_ACCESS_KEY'];
      const secretKey = process.env['ALICLOUD_SECRET_KEY'];

      if (!accountId || !accessKey || !secretKey) {
        await utils.fail('Missing aliyun required environment variables');
      }

      const context = `[default]
aliyun_access_key_secret = ${secretKey}
aliyun_access_key_id = ${accessKey}
aliyun_account_id = ${accountId}`;

      await addCredentials(provider + 'cli', 'credentials', context);
      break;
    }
    default: {
      await utils.fail('No support for this provider');
    }
  }
}

async function addCredentials(
  provider: string,
  fileName: string,
  context: string
) {
  const credentialFile = `${process.env['HOME']}/.${provider}/${fileName}`;
  const folder = path.dirname(credentialFile);

  await utils.info(`Creating ${folder}`);
  await io.mkdirP(folder);

  const writeFileAsync = promisify(writeFile);
  await utils.info(`Adding credentials to ${credentialFile}`);
  await writeFileAsync(credentialFile, context);
}

async function addDotEnv(context: string) {
  const credentialFile = `${process.env['GITHUB_WORKSPACE']}/.env`;
  const writeFileAsync = promisify(writeFile);
  await utils.info(`Adding credentials to ${credentialFile}`);
  await writeFileAsync(credentialFile, context);
}
