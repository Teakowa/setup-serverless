import * as core from '@actions/core';
import {Octokit} from '@octokit/rest';

const octokit = process.env['GITHUB_TOKEN']
  ? new Octokit({
      auth: process.env['GITHUB_TOKEN']
    })
  : new Octokit();

/**
 * Function to read environment variable and return a string value.
 *
 * @param property
 */
export async function readEnv(property: string): Promise<string> {
  const value = process.env[property];
  switch (value) {
    case undefined:
      return '';
    default:
      return value;
  }
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
export async function parseVersion(version: string) {
  switch (version) {
    case 'latest':
      return findLatest();
    default:
      let allVersions = await getAllVersion();

      if (!allVersions.includes(version)) {
        await fail(`The version ${version} is not supported.`);
        throw new Error(`The version ${version} is not supported.`);
      }
      return version;
  }
}

export async function findLatest() {
  const {data} = await octokit.repos.listReleases({
    owner: 'serverless',
    repo: 'serverless',
    per_page: 3
  });

  return data[0].tag_name.substr(1);
}

export async function getAllVersion(total = 300) {
  const {data} = await octokit.repos.listReleases({
    owner: 'serverless',
    repo: 'serverless',
    per_page: total
  });

  let versions: string[] = [];

  for (let item of data) {
    versions.push(item.tag_name.substr(1));
  }

  return versions;
}

export async function fail(message: string) {
  core.setFailed(message);
  process.exit(11);
}

export async function info(message: string) {
  core.info(message);
}
