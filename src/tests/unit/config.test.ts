import { loadConfig } from '../../config';
import { DotenvParseOutput } from 'dotenv';
import { join } from 'path';

const env = process.env;

let path: string | undefined;

describe('Configuration Tests', () => {
  it('should load environment variables', async (): Promise<void> => {
    path = join(__dirname, '.env.test');

    const config: DotenvParseOutput | undefined = await loadConfig(path);

    expect(config.Name).toBe(env.Name);
  });

  it('should fail to load environment variables if env file is not found', async (): Promise<
    void
  > => {
    path = join(__dirname, '..', '.env.test');
    const config: DotenvParseOutput | undefined = await loadConfig(path);

    expect(config).toBe(undefined);
  });
});
