// https://github.com/actions/setup-node/blob/main/__tests__/cache-utils.test.ts

import * as core from '@actions/core';
import * as cache from '@actions/cache';
import path from 'path';
import {mapArch, mapOS, isCacheFeatureAvailable} from '../src/cache-utils';

describe('cache-utils', () => {
  let debugSpy: jest.SpyInstance;
  let isFeatureAvailable: jest.SpyInstance;
  let info: jest.SpyInstance;
  let warningSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env['GITHUB_WORKSPACE'] = path.join(__dirname, 'data');
    debugSpy = jest.spyOn(core, 'debug');
    debugSpy.mockImplementation(msg => {});

    info = jest.spyOn(core, 'info');
    warningSpy = jest.spyOn(core, 'warning');

    isFeatureAvailable = jest.spyOn(cache, 'isFeatureAvailable');
  });

  // mapArch tests
  it('mapArch returns arm for arm', () => {
    expect(mapArch('arm')).toBe('arm');
  });

  it('mapArch returns amd64 for x64', () => {
    expect(mapArch('x64')).toBe('amd64');
  });

  it('mapArch returns 386 for x32', () => {
    expect(mapArch('x32')).toBe('386');
  });

  it('mapArch returns arm64 for arm64', () => {
    expect(mapArch('arm64')).toBe('arm64');
  });

  // mapOS tests
  it('mapOS returns darwin for darwin', () => {
    expect(mapOS('darwin')).toBe('darwin');
  });

  it('mapOS returns linux for linux', () => {
    expect(mapOS('linux')).toBe('linux');
  });

  it('mapOS returns windows for win32', () => {
    expect(mapOS('win32')).toBe('windows');
  });

  // isCacheFeatureAvailable tests
  it('isCacheFeatureAvailable for GHES is false', () => {
    isFeatureAvailable.mockImplementation(() => false);
    process.env['GITHUB_SERVER_URL'] = 'https://www.test.com';

    expect(isCacheFeatureAvailable()).toBeFalsy();
    expect(warningSpy).toHaveBeenCalledWith(
      'Cache action is only supported on GHES version >= 3.5. If you are on version >=3.5 Please check with GHES admin if Actions cache service is enabled or not.'
    );
  });

  it('isCacheFeatureAvailable for GHES has an interhal error', () => {
    isFeatureAvailable.mockImplementation(() => false);
    process.env['GITHUB_SERVER_URL'] = '';
    isCacheFeatureAvailable();
    expect(warningSpy).toHaveBeenCalledWith(
      'The runner was not able to contact the cache service. Caching will be skipped'
    );
  });

  it('isCacheFeatureAvailable for GHES is available', () => {
    isFeatureAvailable.mockImplementation(() => true);

    expect(isCacheFeatureAvailable()).toStrictEqual(true);
  });

  afterEach(() => {
    process.env['GITHUB_SERVER_URL'] = '';
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
});
