// External
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as utils from './utils';
import * as credential from './credential';

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
