import { DotenvParseOutput } from 'dotenv';
import { MigrationDataElements } from '../../models';
import { Connection, IsNull } from 'typeorm';

export const createChunkCounter = async (
  config: DotenvParseOutput,
  connection: Connection,
  migrationId: number
): Promise<number[]> => {

  const migrationDataElementsCount = await connection
    .getRepository(MigrationDataElements)
    .count({
      where: {
        migrationId,
        isProccessed: true,
        migratedAt: IsNull(),
      },
    });

  const limit = Number(config.DFQW_DATA_CHUNK_SIZE || 1000);
  const counter = Math.ceil(Number(migrationDataElementsCount) / limit);

  return new Array(counter);
};
