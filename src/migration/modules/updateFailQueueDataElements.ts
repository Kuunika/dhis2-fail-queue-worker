import { FailQueue } from '../../models';
import { Connection } from 'typeorm';

export const updateFailQueueDataElements = async (
  connection: Connection,
  migrationId: number,
  attempts: number
): Promise<void> => {
  await connection
    .createQueryBuilder(FailQueue, 'failqueue')
    .update(FailQueue)
    .set({ attempts })
    .where(
      'failqueue.migrationId IN (:failqueue)',
      {
        failqueue: [migrationId],
      }
    )
    .execute();
};
