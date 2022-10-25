import * as utils from '../src/utils';
import {Octokit} from '@octokit/rest';
const octokit = new Octokit();

describe('Utils tests', () => {
  it('checking readEnv', async () => {
    process.env['test'] = 'setup-serverless';
    expect(await utils.readEnv('test')).toBe('setup-serverless');
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
});
