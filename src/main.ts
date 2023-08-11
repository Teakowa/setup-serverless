// External
import * as core from '@actions/core';
import {exec} from '@actions/exec';
import * as utils from './utils';
import {isCacheFeatureAvailable} from './cache-utils';
import {useProvider} from './credential';
import {restoreCache, download} from './cache-restore';

export async function run() {
  try {
    const version: string = await utils.parseVersion(
      await utils.getInput('serverless_version', false)
    );

    await utils.info(`Installing serverless version ${version} ...`);
    await install(version);
    await utils.info(`Installed serverless version ${version}`);

    const provider = await utils.getInput('provider', true);

    if (provider) {
      await useProvider(provider);
      await utils.info(`Setup provider ${provider} credential.`);
    }
  } catch (error) {
    if (error instanceof Error) await utils.fail(error.message);
  }
}

async function install(version: string) {
  const slsFolder = `${process.env.HOME}/.serverless/bin`;

  if (isCacheFeatureAvailable()) {
    await restoreCache(version);
  } else {
    await download(version);
  }

  core.debug(`Adding ${slsFolder} to PATH`);
  core.addPath(slsFolder);
  core.debug(`PATH: ${process.env.PATH}`);

  await exec('sls -v');
}
