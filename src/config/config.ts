import { config, DotenvParseOutput } from 'dotenv';
import { existsSync } from 'fs';

/**
 * Load environment variables
 *
 * @param { string } path - Environment variable path.
 * @returns { DotenvParseOutput | undefined } - environment variables
 */
// TODO: return DotenvParseOutput only. throw error if undefined
const loadConfig = async (
  path: string
): Promise<DotenvParseOutput | undefined> => {
  if (!existsSync(path)) {
    // TODO: return file not found exception
    throw new Error('message');
  }

  const { error, parsed } = await config({ path });
  if (error) {
    // TODO: throw parse error
    return undefined;
  }

  return parsed;
};

export { DotenvParseOutput, loadConfig };

// TODO: create an error class for errors
