import * as utils from '../src/utils';
import {Octokit} from '@octokit/rest';
const octokit = new Octokit();

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

  it('checking parseVersion', async () => {
    expect(await utils.parseVersion('3.27.0')).toBe('3.27.0');
    expect(await utils.parseVersion('2.71.0')).toBe('2.71.0');
  });

  it('checking findLatest', async () => {
    const {data: latest_tag} = await octokit.repos.getLatestRelease({
      owner: 'serverless',
      repo: 'serverless'
    });
    expect(await utils.findLatest()).toBe(latest_tag.tag_name.substring(1));
  });

  it('checking getAllVersion', async () => {
    expect(await utils.getAllVersion(2));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
