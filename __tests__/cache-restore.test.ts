import * as core from '@actions/core';
import * as glob from '@actions/glob';
import * as cache from '@actions/cache';
import * as path from 'path';
import {restoreCache} from '../src/cache-restore';

describe('cache-restore', () => {
  process.env['GITHUB_WORKSPACE'] = path.join(__dirname, 'data');

  const cachePath = `${process.env.HOME}/.serverless/bin`;
  const slsFileHash =
    'abf7c9b306a3149dcfba4673e2362755503bcceaab46f0e4e6fee0ade493e20c';

  let debugSpy: jest.SpyInstance;
  let infoSpy: jest.SpyInstance;
  let setOutputSpy: jest.SpyInstance;
  let restoreCacheSpy: jest.SpyInstance;
  let hashFilesSpy: jest.SpyInstance;

  const cachesObject = {
    [cachePath]: slsFileHash
  };

  let saveStateSpy: jest.SpyInstance;

  beforeEach(() => {
    // core
    infoSpy = jest.spyOn(core, 'info');
    infoSpy.mockImplementation(() => undefined);

    debugSpy = jest.spyOn(core, 'debug');
    debugSpy.mockImplementation(() => undefined);

    setOutputSpy = jest.spyOn(core, 'setOutput');
    setOutputSpy.mockImplementation(() => undefined);

    saveStateSpy = jest.spyOn(core, 'saveState');
    saveStateSpy.mockImplementation(() => undefined);

    // glob
    hashFilesSpy = jest.spyOn(glob, 'hashFiles');
    hashFilesSpy.mockImplementation((pattern: string) => {
      if (pattern.includes('serverless')) {
        return slsFileHash;
      } else {
        return '';
      }
    });

    // cache
    restoreCacheSpy = jest.spyOn(cache, 'restoreCache');
    restoreCacheSpy.mockImplementation(
      (cachePaths: Array<string>, key: string) => {
        if (!cachePaths || cachePaths.length === 0) {
          return undefined;
        }

        const cachePath = cachePaths[0];
        const fileHash = cachesObject[cachePath];

        if (key.includes(fileHash)) {
          return key;
        }

        return undefined;
      }
    );
  });

  describe('Restore cache', () => {
    it.each([
      ['linux', 'amd64', '3.19.0', slsFileHash],
      ['darwin', 'arm64', '3.19.0', slsFileHash]
    ])(
      'restored dependencies for %s',
      async (platform, arch, version, fileHash) => {
        await restoreCache(version);

        expect(hashFilesSpy).toHaveBeenCalled();
        expect(infoSpy).not.toHaveBeenCalledWith(
          `Cache not found for input keys:`
        );
        expect(setOutputSpy).toHaveBeenCalledWith('cache-hit', true);
      }
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
});
