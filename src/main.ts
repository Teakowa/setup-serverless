// Node.js core
import {promises} from 'fs';
import * as path from 'path';

// External
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';

export async function main(
  provider: string,
  secretId: string,
  secretKey: string,
  version: string
) {
  if (!provider || !secretId || secretKey) {
    throw new Error('Missing required arguments');
  }

  if (!version) {
    version = '@latest';
    core.info('');
  }
}

async function useProvider(
  provider: string,
  secretId: string,
  secretKey: string
) {
  switch (provider) {
    case 'aws': {
      break;
    }
    case 'tencent': {
      const accountId = core.getInput('tencent_appid');
      if (!accountId) {
        throw new Error('Missing required arguments: ' + 'tencent_appid');
      }

      const context = `[default]
tencent_appid = ${accountId}
tencent_secret_id = ${secretId}
tencent_secret_key = ${secretKey}`.trim();

      await addCredentials(provider, 'credentials', context);
      break;
    }
    case 'aliyuncli': {
      const accountId = core.getInput('aliyun_account_id');
      if (!accountId) {
        throw new Error('Missing required arguments: ' + 'aliyun_account_id');
      }

      const context = `[default]
aliyun_access_key_secret = ${secretKey}
aliyun_access_key_id = ${secretId}
aliyun_account_id = ${accountId}`;

      await addCredentials(provider, 'credentials', context);
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
  const credentialFile = `~/.${provider}/${fileName}`;
  const folder = path.dirname(credentialFile);

  core.info(`Creating ${folder}`);
  await io.mkdirP(folder);

  core.info(`Adding credentials to ${fileName}`);
  await promises.writeFile(fileName, context);
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
    const secretId = core.getInput('secret_id');
    const secretKey = core.getInput('secret_key');

    if (!provider || !secretId || !secretKey) {
      core.error('Missing required arguments');
    }

    await useProvider(provider, secretId, secretKey);
    core.info(`Using provider ${provider}.`);
  } catch (error) {
    core.error(error);
    throw error;
  }
}
