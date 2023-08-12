import * as utils from '../src/utils';
const octokit = utils.getOctokit();
const slsVersion = '3.27.0';

/**
 * Mock @actions/core
 */
jest.mock('@actions/core', () => ({
  getInput: jest.fn().mockImplementation(key => {
    return ['setup-serverless'].indexOf(key) !== -1 ? key : '';
  })
}));

jest.spyOn(octokit.repos, 'listReleases');
jest.spyOn(octokit.repos, 'getLatestRelease');

beforeEach(() => {
  process.env['test'] = 'setup-serverless';
  process.env['test-hyphen'] = 'setup-serverless';
  process.env['setup-serverless'] = 'setup-serverless';
});

describe('Utils tests', () => {
  it('checking readEnv', async () => {
    expect(await utils.readEnv('test')).toBe('setup-serverless');
    expect(await utils.readEnv('TEST')).toBe('setup-serverless');
    expect(await utils.readEnv('test_hyphen')).toBe('setup-serverless');
    expect(await utils.readEnv('TEST_HYPHEN')).toBe('setup-serverless');
    expect(await utils.readEnv('undefined')).toBe('');
  });

  it('checking getInput', async () => {
    expect(await utils.getInput('test', false)).toBe('setup-serverless');
    expect(await utils.getInput('setup-serverless', false)).toBe(
      'setup-serverless'
    );
    expect(await utils.getInput('DoesNotExist', false)).toBe('');
    await expect(async () => {
      await utils.getInput('DoesNotExist', true);
    }).rejects.toThrow('Input required and not supplied: DoesNotExist');
  });

  describe('parseVersion', () => {
    it('should return latest version when input is null', async () => {
      const result = await utils.parseVersion(null);
      expect(result).not.toBeNull();
    });

    it('should return latest version when input is "latest"', async () => {
      const result = await utils.parseVersion('latest');
      expect(result).not.toBeNull();
    });

    it('should return the same version when input is a valid version', async () => {
      const result = await utils.parseVersion(slsVersion);
      expect(result).toEqual(slsVersion);
    });
  });

  it('checking findLatest', async () => {
    const {data: latest_tag} = await octokit.repos.getLatestRelease({
      owner: 'serverless',
      repo: 'serverless'
    });
    expect(await utils.findLatest()).toBe(latest_tag.tag_name.substring(1));
  });

  it('checking getVersion', async () => {
    expect(await utils.getVersion(slsVersion)).toBe(slsVersion);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
