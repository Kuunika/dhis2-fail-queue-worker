import { Connection } from 'typeorm';
import { Migration } from '../../models';

export const updateMigration = async (
  connection: Connection,
  migrationId: number,
  migrationDataElementsSuccess: number[]
): Promise<void> => {

  const migration: Migration = await connection
    .getRepository(Migration)
    .findOne({ id: migrationId });

  if (migration) {
    migration.totalMigratedElements += migrationDataElementsSuccess.length;
    migration.totalFailedElements -= migrationDataElementsSuccess.length;
    await connection.getRepository(Migration).save(migration);
  }
};
