// External
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as utils from './utils';
import * as credential from './credential';
import {saveCache, restoreCache} from '@actions/cache';
import * as os from 'os';

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

  const platform = mapOS(os.platform());
  const arch = mapArch(os.arch());
  const key = `serverless-${platform}-${arch}-${version}-${await utils.getInput(
    'provider',
    true
  )}-${parseInt((new Date().getTime() / 1000).toFixed(0))}`;
  const restoreKeys = [
    `serverless-${platform}-${arch}-${version}-${await utils.getInput(
      'provider',
      true
    )}-`
  ];
  const slsBin = `${process.env.HOME}/.serverless/bin`;
  const slsFolder = [`${slsBin}/serverless`];

  await core.exportVariable('npm_config_loglevel', 'silent');
  await core.exportVariable('NPM_CONFIG_LOGLEVEL', 'silent');
  await core.exportVariable('VERSION', version);

  await utils.info(`Try to restore cache...`);
  const cacheKey = await restoreCache([slsBin], key, restoreKeys);

  if (!cacheKey) {
    await exec.exec(
      `/bin/bash -c "curl -o- -L https://slss.io/install | VERSION=${version} bash"`,
      [],
      execOptions
    );
  }
  core.addPath(slsBin);

  const cacheId = await saveCache([slsBin], key);
  await utils.info(`cacheId: ${cacheId}`);

  await exec.exec('sls -v');
  await exec.exec(`${slsFolder} binary-postinstall`);

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
