// External
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as tc from '@actions/tool-cache';
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
  let toolPath: string;
  toolPath = tc.find('serverless', version);

  if (toolPath) {
    await utils.info(`Found in cache @ ${toolPath}`);
  } else {
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

    const os_version = process.platform;

    const binary_url = `https://github.com/serverless/serverless/releases/download/v${version}/serverless-${os_version}-x64`;
    const binaries_path = `${process.env['HOME']}/.serverless/bin`;
    const binary_path = `${binaries_path}/${version}/serverless`;

    await utils.info(`Downloading binary from ${binary_url} ...`);
    await io.mkdirP(`${binaries_path}/${version}`);
    let downloaded_file = await tc.downloadTool(
      binary_url,
      binaries_path + `/serverless-${os_version}-x64`
    );
    await io.mv(downloaded_file, binary_path);
    await exec.exec('ls', [`${process.env['HOME']}/.serverless/bin/`]);
    await exec.exec('sudo chmod', ['+x', binary_path]);

    await core.addPath(binaries_path);
    await utils.info(
      `Added by serverless binary installer export PATH=${process.env['PATH']}`
    );

    await exec.exec(binary_path, ['binary-postinstall'], execOptions);

    await utils.info('Adding to the cache ...');
    await tc.cacheDir(`${binaries_path}/${version}`, 'serverless', version);
    await utils.info('Done');

    return {
      stdout: output,
      stderr: errOutput
    };
  }
}
