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
      const command =
        'export AWS_ACCESS_KEY_ID=${secretId} && export AWS_SECRET_ACCESS_KEY=${secretKey}';
      await exec.exec(command);
      break;
    }
    case 'tencent': {
      const accountId = core.getInput('tencent_appid');
      if (!accountId) {
        throw new Error('Missing required arguments');
      }

      const context = `[default]
tencent_appid = ${accountId}
tencent_secret_id = ${secretId}
tencent_secret_key = ${secretKey}`.trim();

      await addCredentials(provider, 'credentials', context);

      const command =
        'export TENCENTCLOUD_SECRET_ID=${secretId} && export TENCENTCLOUD_SECRET_KEY=${secretKey}';
      await exec.exec(command);

      break;
    }
    case 'aliyuncli': {
      const accountId = core.getInput('aliyun_account_id');
      if (!accountId) {
        throw new Error('Missing required arguments');
      }

      const context = `[default]
aliyun_access_key_secret = ${secretKey}
aliyun_access_key_id = ${secretId}
aliyun_account_id = ${accountId}`;

      await addCredentials(provider, 'credentials', context);

      const command =
        'export ALICLOUD_ACCESS_KEY=${secretId} && export ALICLOUD_SECRET_KEY=${secretKey}';
      await exec.exec(command);

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

  core.debug(`Creating ${folder}`);
  await io.mkdirP(folder);

  core.debug(`Adding credentials to ${fileName}`);
  await promises.writeFile(fileName, context);
}

export async function run() {
  const provider = core.getInput('provider');
  const secretId = core.getInput('secretId');
  const secretKey = core.getInput('secretKey');

  if (!provider || !secretId || !secretKey) {
    throw new Error('Missing required arguments');
  }

  try {
    const version =
      core.getInput('version').toLowerCase() === 'latest'
        ? 'latest'
        : core.getInput('version').toLowerCase();

    if (version) {
      await exec.exec('npm install -g serverless@${version}');
    }

    await useProvider(provider, secretId, secretKey);
  } catch (error) {
    core.error(error);
    throw error;
  }
}
