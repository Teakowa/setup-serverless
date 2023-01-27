import * as utils from '../src/utils';
import {Octokit} from '@octokit/rest';
const octokit = new Octokit();

jest.setTimeout(30000);

/**
 * Mock @actions/core
 */
jest.mock('@actions/core', () => ({
  getInput: jest.fn().mockImplementation(key => {
    return ['setup-serverless'].indexOf(key) !== -1 ? key : '';
  })
}));

describe('Utils tests', () => {
  it('checking readEnv', async () => {
    process.env['test'] = 'setup-serverless';
    process.env['test-hyphen'] = 'setup-serverless';
    expect(await utils.readEnv('test')).toBe('setup-serverless');
    expect(await utils.readEnv('TEST')).toBe('setup-serverless');
    expect(await utils.readEnv('test_hyphen')).toBe('setup-serverless');
    expect(await utils.readEnv('TEST_HYPHEN')).toBe('setup-serverless');
    expect(await utils.readEnv('undefined')).toBe('');
  });

  it('checking getInput', async () => {
    process.env['test'] = 'setup-serverless';
    process.env['setup-serverless'] = 'setup-serverless';
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
    await new Promise(r => setTimeout(r, 5000));
    expect(await utils.parseVersion('2.71.0')).toBe('2.71.0');
  });

  it('checking findLatest', async () => {
    await new Promise(r => setTimeout(r, 5000));
    const {data: latest_tag} = await octokit.repos.getLatestRelease({
      owner: 'serverless',
      repo: 'serverless'
    });
    expect(await utils.findLatest()).toBe(latest_tag.tag_name.substring(1));
  });

  it('checking getAllVersion', async () => {
    await new Promise(r => setTimeout(r, 5000));
    expect(await utils.getAllVersion(2));
  });
});
