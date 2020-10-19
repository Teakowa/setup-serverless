import * as core from '@actions/core';

export async function fail(message: string) {
  core.setFailed(message);
  process.exit(11);
}

export async function info(message: string) {
  core.info(message);
}
