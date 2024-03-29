import * as core from '@actions/core';
import * as cache from '@actions/cache';
import * as utils from './utils';
import {mapArch, mapOS} from './cache-utils';
import * as glob from '@actions/glob';
import os from 'os';
import {exec} from '@actions/exec';
import * as fs from 'fs';
import * as path from 'path';

const platform = mapOS(os.platform());
const arch = mapArch(os.arch());
const cachePath = `${process.env.HOME}/.serverless/bin`;
const slsBin = `${cachePath}/serverless`;

export const restoreCache = async (version: string) => {
  const fileHash = await glob.hashFiles(slsBin);
  core.debug(`File hash: ${fileHash}`);

  const primaryKey = `serverless-${platform}-${arch}-${version}-${fileHash}`;
  core.debug(`primary key is ${primaryKey}`);

  core.debug(`Try to restore cache...`);
  const cacheKey = await cache.restoreCache([cachePath], primaryKey);
  const restoredPath = path.join(cachePath, 'serverless');

  if (!cacheKey) {
    core.debug(`Cache not found for input keys: ${primaryKey}`);

    if (!fs.existsSync(restoredPath)) {
      core.debug(`The specified serverless at: ${restoredPath} does not exist`);
      // try to download
      await download(version);
    }

    return false;
  }

  core.debug(`Cache restored from key: ${cacheKey}`);
  core.debug(`Cache restored at path: ${restoredPath}`);

  core.setOutput('cache-hit', Boolean(cacheKey));
  await utils.info(`Cache restored from key: ${cacheKey}`);
  return true;
};

export const download = async (version: string) => {
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

  core.debug(`cache is not found`);

  await utils.info(`Attempting to download ${version}`);
  await exec(
    `/bin/bash -c "curl -o- -L https://slss.io/install | VERSION=${version} bash"`,
    [],
    execOptions
  );

  const fileHash = await glob.hashFiles(slsBin);
  core.debug(`File hash: ${fileHash}`);

  const primaryKey = `serverless-${platform}-${arch}-${version}-${fileHash}`;
  const cacheId = await cache.saveCache([cachePath], primaryKey);
  if (cacheId == -1) {
    return;
  }
  core.setOutput('cache-hit', Boolean(cacheId));
  await utils.info(`Cache saved with key: ${cacheId}`);
};
