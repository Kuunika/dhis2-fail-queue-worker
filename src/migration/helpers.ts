import { Connection } from 'typeorm';
import { DataElement, FailQueue } from './../models';

interface Where {
  migrationId: number;
  isMigrated: boolean;
}

interface Payload {
  id: number;
  dataElement: string;
  value: number;
  orgUnit: string;
  period: string;
}

interface Message {
  email: string;
  client: string;
  attempts: number;
  channelId: string;
  migrationId: number;
  lastAttempt: any;
}

/**
 * Get fail queue count
 *
 * @param { Connection } connection - Connection manager instance
 */
const createCounter = async (
  connection: Connection,
  where: Where
): Promise<any> => {
  const failQueueCount: number = await connection
    .getRepository(FailQueue)
    .count({ where });

  if (!failQueueCount) {
    return [];
  }

  const limit = Number(process.env.DFQW_DATA_CHUNK_SIZE || 1000);
  const counter = Math.ceil(failQueueCount / limit);

  return new Array(counter);
};

/**
 * Get data element
 *
 * @param { Connection } connection - Connection manager instance
 * @param { number } id - Data element id.
 */
const getDataElement = async (
  connection: Connection,
  id: number
): Promise<DataElement> => {
  return connection.getRepository(DataElement).findOne({ id });
};

/**
 * Get fail queues
 *
 * @param { Connection } connection - Connection manager instance
 * @param { Where } where - Where clause.
 * @param { number } skip - fail queues to skip.
 */
const getFailQueues = async (
  connection: Connection,
  where: Where,
  skip: number
): Promise<FailQueue[]> => {
  const limit = Number(process.env.DFQW_DATA_CHUNK_SIZE || 1000);
  return connection.getRepository(FailQueue).find({
    skip: skip * limit,
    take: limit,
    where,
  });
};

/**
 * Update fail queues
 *
 * @param { Connection } connection - Connection manager instance
 * @param { Where } where - Where clause.
 */
const updateFailQueues = async (
  connection: Connection,
  ids: number[],
  update: object
): Promise<void> => {
  await connection
    .createQueryBuilder(FailQueue, 'failqueue')
    .update(FailQueue)
    .set(update)
    .where('failqueue.id IN (:failqueue)', { failqueue: ids })
    .execute();
};

/**
 * Get fail queues
 *
 * @param { Connection } connection - Connection manager instance
 * @param { Where } where - Where clause.
 * @param { number } skip - fail queues to skip.
 */
const preparePayload = async (
  connection: Connection,
  failQueues: FailQueue[]
): Promise<Payload[]> => {
  const payLoad: Payload[] = [];

  for (const failQueue of failQueues) {
    const {
      id,
      value,
      dataElementId,
      period,
      organizationUnitCode,
    } = failQueue;

    const dataElement = await getDataElement(connection, dataElementId);

    if (dataElement) {
      await payLoad.push({
        dataElement: dataElement.dataElementId,
        id,
        orgUnit: organizationUnitCode,
        period,
        value,
      });
    } else {
      await console.log('data element missing');
    }
  }

  return payLoad;
};

/**
 * Get payload ids
 *
 * @param { Payload } payload -  payload.
 */
const getPayloadId = (payload: Payload[]): number[] => {
  const ids: number[] = [];

  for (const row of payload) {
    ids.push(row.id);
  }

  return ids;
};

export {
  createCounter,
  getDataElement,
  getFailQueues,
  getPayloadId,
  Message,
  Payload,
  preparePayload,
  updateFailQueues,
  Where
};
