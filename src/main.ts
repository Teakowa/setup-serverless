// Node.js core
import {writeFile} from 'fs';
import * as path from 'path';
import {promisify} from 'util';

// External
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';

async function useProvider(provider: string) {
  switch (provider) {
    case 'aws': {
      if (
        !process.env['AWS_ACCESS_KEY_ID'] ||
        !process.env['AWS_SECRET_ACCESS_KEY']
      ) {
        core.setFailed(
          'Missing aws required environment variables: AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY'
        );
      }
      break;
    }
    case 'tencent': {
      const appid = process.env['TENCENT_APPID'];
      const secretId = process.env['TENCENT_SECRET_ID'];
      const secretKey = process.env['TENCENT_SECRET_KEY'];

      if (!appid || !secretId || !secretKey) {
        core.setFailed('Missing tencent required environment variables.');
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
      break;
    }
    case 'aliyun': {
      const accountId = process.env['ALICLOUD_ACCOUNT_ID'];
      const accessKey = process.env['ALICLOUD_ACCESS_KEY'];
      const secretKey = process.env['ALICLOUD_SECRET_KEY'];

      if (!accountId || !accessKey || !secretKey) {
        core.setFailed('Missing aliyun required environment variables');
      }

      const context = `[default]
aliyun_access_key_secret = ${secretKey}
aliyun_access_key_id = ${accessKey}
aliyun_account_id = ${accountId}`;

      await addCredentials(provider + 'cli', 'credentials', context);
      break;
    }
    default: {
      core.error('No support for this provider');
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

  core.info(`Creating ${folder}`);
  await io.mkdirP(folder);

  const writeFileAsync = promisify(writeFile);
  core.info(`Adding credentials to ${credentialFile}`);
  await writeFileAsync(credentialFile, context);
}

async function addDotEnv(context: string) {
  const credentialFile = `${process.env['GITHUB_WORKSPACE']}/.env`;
  const writeFileAsync = promisify(writeFile);
  core.info(`Adding credentials to ${credentialFile}`);
  await writeFileAsync(credentialFile, context);
}

export async function run() {
  try {
    const version =
      core.getInput('serverless_version').toLowerCase() === 'latest'
        ? 'latest'
        : core.getInput('serverless_version').toLowerCase();

    if (version) {
      core.info(`Installing serverless version ${version} ...`);
      await exec.exec(`sudo npm install -g serverless@${version}`);
      core.info(`Installed serverless version ${version}`);
    }

    const provider = core.getInput('provider');

    if (!provider) {
      core.setFailed('Missing required arguments');
    }

    await useProvider(provider);
    core.info(`Using provider ${provider}.`);
  } catch (error) {
    core.error(error);
    throw error;
  }
}
