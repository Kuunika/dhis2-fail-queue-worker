import { config, DotenvParseOutput } from 'dotenv';
import { existsSync } from 'fs';

/**
 * Load environment variables
 *
 * @param { string } path - Environment variable path.
 * @returns { DotenvParseOutput | undefined } - environment variables
 */
const loadConfig = async (
  path: string
): Promise<DotenvParseOutput | undefined> => {
  if (!existsSync(path)) {
    return undefined;
  }

  const { error, parsed } = await config({ path });
  if (error) {
    return undefined;
  }

  return parsed;
};

export { DotenvParseOutput, loadConfig };
