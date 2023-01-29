import * as core from '@actions/core';
import * as cache from '@actions/cache';
import * as utils from './utils';
import {mapArch, mapOS} from './cache-utils';
import * as glob from '@actions/glob';
import os from 'os';
import {exec} from '@actions/exec';
import * as fs from 'fs';

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

  if (!cacheKey) {
    core.debug(`Cache not found for input keys: ${primaryKey}`);
    return false;
  }
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

  if (!fs.existsSync(cachePath)) {
    throw new Error(
      `Cache folder path is retrieved for severless but doesn't exist on disk: ${cachePath}`
    );
  }

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
