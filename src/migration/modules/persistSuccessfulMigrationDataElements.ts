import { MigrationDataElements } from '../../models';
import { Connection } from 'typeorm';

export const persistSuccessfulMigrationDataElements = async (
  connection: Connection,
  ids: number[]
): Promise<void> => {
  await connection
    .createQueryBuilder(MigrationDataElements, 'migrationdataelements')
    .update(MigrationDataElements)
    .set({ migratedAt: new Date(Date.now()) })
    .where(
      'migrationdataelements.id IN (:migrationdataelements)',
      {
        migrationdataelements: ids,
      }
    )
    .execute();
};
