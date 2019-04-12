import { DotenvParseOutput } from 'dotenv';
import { MigrationDataElements } from '../../models';
import { Connection, IsNull } from 'typeorm';

export const getMigrationDataElements = async (
  config: DotenvParseOutput,
  connection: Connection,
  migrationId: number,
  skip: number
): Promise<MigrationDataElements[]> => {
  const limit = Number(config.DFQW_DATA_CHUNK_SIZE || 1000);
  return connection.getRepository(MigrationDataElements).find({
    skip: skip * limit,
    take: limit,
    where: {
      migrationId,
      isProccessed: true,
      migratedAt: IsNull(),
    },
  });
};
