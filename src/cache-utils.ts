// https://github.com/actions/setup-node/blob/main/src/cache-utils.ts

import * as cache from '@actions/cache';
import * as core from '@actions/core';

// arch in [arm, x32, x64...] (https://nodejs.org/api/os.html#os_os_arch)
// return value in [amd64, 386, arm]

export function mapArch(arch) {
  const mappings = {
    x32: '386',
    x64: 'amd64'
  };
  return mappings[arch] || arch;
}

// os in [darwin, linux, win32...] (https://nodejs.org/api/os.html#os_os_platform)
// return value in [darwin, linux, windows]
export function mapOS(os) {
  const mappings = {
    win32: 'windows'
  };
  return mappings[os] || os;
}

export function isGhes(): boolean {
  const ghUrl = new URL(
    process.env['GITHUB_SERVER_URL'] || 'https://github.com'
  );
  return ghUrl.hostname.toUpperCase() !== 'GITHUB.COM';
}

export function isCacheFeatureAvailable(): boolean {
  if (cache.isFeatureAvailable()) return true;

  if (isGhes()) {
    core.warning(
      'Cache action is only supported on GHES version >= 3.5. If you are on version >=3.5 Please check with GHES admin if Actions cache service is enabled or not.'
    );
    return false;
  }

  core.warning(
    'The runner was not able to contact the cache service. Caching will be skipped'
  );

  return false;
}
