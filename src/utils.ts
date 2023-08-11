import * as core from '@actions/core';
import {Octokit} from '@octokit/rest';
import fetch from 'node-fetch';

export function getOctokit(): Octokit {
  return new Octokit({
    auth: process.env['GITHUB_TOKEN'],
    request: {
      fetch
    }
  });
}

/**
 * Function to read environment variable and return a string value.
 *
 * @param property
 *
 * https://github.com/shivammathur/setup-php/blob/master/src/utils.ts
 *
 */
export async function readEnv(property: string): Promise<string> {
  const property_lc: string = property.toLowerCase();
  const property_uc: string = property.toUpperCase();
  return (
    process.env[property] ||
    process.env[property_lc] ||
    process.env[property_uc] ||
    process.env[property_lc.replace('_', '-')] ||
    process.env[property_uc.replace('_', '-')] ||
    ''
  );
}

/**
 * Function to get inputs from both with and env annotations.
 *
 * @param name
 * @param mandatory
 */
export async function getInput(
  name: string,
  mandatory: boolean
): Promise<string> {
  const input = core.getInput(name);
  const env_input = await readEnv(name);
  switch (true) {
    case input != '':
      return input;
    case input == '' && env_input != '':
      return env_input;
    case input == '' && env_input == '' && mandatory:
      throw new Error(`Input required and not supplied: ${name}`);
    default:
      return '';
  }
}

/**
 * Function to parse Serverless version.
 *
 * @param version
 */
export async function parseVersion(version: string | null): Promise<string> {
  if (!version || version === 'latest') {
    return findLatest();
  }

  return await getVersion(version);
}

export async function findLatest(): Promise<string> {
  const octokit = getOctokit();

  const {data} = await octokit.repos.getLatestRelease({
    owner: 'serverless',
    repo: 'serverless'
  });

  return data.tag_name.substring(1);
}

export async function getVersion(version: string): Promise<string> {
  const octokit = getOctokit();

  const {data} = await octokit.repos.getReleaseByTag({
    owner: 'serverless',
    repo: 'serverless',
    tag: `v${version}`
  });

  return data.tag_name.substring(1);
}

export async function fail(message: string) {
  core.setFailed(message);
  process.exit(11);
}

export async function info(message: string) {
  core.info(message);
}
