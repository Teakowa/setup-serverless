// External
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as utils from './utils';
import * as credential from './credential';
import {saveCache, restoreCache} from '@actions/cache';
import * as os from 'os';
import * as glob from '@actions/glob';

export async function run() {
  try {
    const version: string = await utils.parseVersion(
      await utils.getInput('serverless_version', false)
    );

    await utils.info(`Installing serverless version ${version} ...`);
    await install(version);
    await utils.info(`Installed serverless version ${version}`);

    const provider = await utils.getInput('provider', true);

    if (!provider) {
      await utils.fail('Missing required arguments');
    }

    await credential.useProvider(provider);
    await utils.info(`Using provider ${provider}.`);
  } catch (error) {
    if (error instanceof Error) await utils.fail(error.message);
  }
}

async function install(version: string) {
  let output = '';
  let errOutput = '';

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

  const provider = await utils.getInput('provider', true);
  const slsFolder = `${process.env.HOME}/.serverless/bin`;
  const slsBin = `${slsFolder}/serverless`;
  const platform = mapOS(os.platform());
  const arch = mapArch(os.arch());

  const restoreKeys = [
    `serverless-${platform}-${arch}-${version}-${provider}-`,
    `serverless-${platform}-${arch}-${version}-`
  ];

  const fileHash = await glob.hashFiles(slsBin);

  core.debug(`Try to restore cache...`);
  const key = `serverless-${platform}-${arch}-${version}-${provider}-${fileHash}`;
  const cacheKey = await restoreCache([slsFolder], key, restoreKeys);

  if (!cacheKey) {
    core.debug(`cache is not found`);
    await utils.info(`Attempting to download ${version}`);
    await exec.exec(
      `/bin/bash -c "curl -o- -L https://slss.io/install | VERSION=${version} bash"`,
      [],
      execOptions
    );

    const key = `serverless-${platform}-${arch}-${version}-${provider}-${fileHash}`;
    const cacheId = await saveCache([slsFolder], key);
    core.debug(`cacheId: ${cacheId}`);
    if (cacheId == -1) {
      return;
    }
  } else {
    core.setOutput('cache-hit', Boolean(cacheKey));
    await utils.info(`Cache restored from key: ${cacheKey}`);
  }

  core.addPath(slsFolder);
  await exec.exec('sls -v');

  return {
    stdout: output,
    stderr: errOutput
  };
}

// arch in [arm, x32, x64...] (https://nodejs.org/api/os.html#os_os_arch)
// return value in [amd64, 386, arm]
function mapArch(arch) {
  const mappings = {
    x32: '386',
    x64: 'amd64'
  };
  return mappings[arch] || arch;
}

// os in [darwin, linux, win32...] (https://nodejs.org/api/os.html#os_os_platform)
// return value in [darwin, linux, windows]
function mapOS(os) {
  const mappings = {
    win32: 'windows'
  };
  return mappings[os] || os;
}
