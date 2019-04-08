import { Connection } from 'typeorm';
import { DataElement, FailedDataElement } from './../models';

interface Where {
  migrationId: number;
  isMigrated: boolean;
}

interface DHIS2DataElement {
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
    .getRepository(FailedDataElement)
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
): Promise<FailedDataElement[]> => {
  const limit = Number(process.env.DFQW_DATA_CHUNK_SIZE || 1000);
  return connection.getRepository(FailedDataElement).find({
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
const updateFailedDataElements = async (
  connection: Connection,
  ids: number[],
  update: object
): Promise<void> => {
  await connection
    .createQueryBuilder(FailedDataElement, 'failqueue')
    .update(FailedDataElement)
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
const getDHIS2DataElements = async (
  connection: Connection,
  failedDataElements: FailedDataElement[]
): Promise<DHIS2DataElement[]> => {
  const dhis2DataElements: DHIS2DataElement[] = [];

  for (const failedDataElement of failedDataElements) {
    const {
      id,
      value,
      dataElementId,
      period,
      organizationUnitCode,
    } = failedDataElement;

    const dataElement = await getDataElement(connection, dataElementId);

    if (dataElement) {
      await dhis2DataElements.push({
        dataElement: dataElement.dataElementId,
        id,
        orgUnit: organizationUnitCode,
        period,
        value,
      });
    } else {
      // TODO: log this with winston
      await console.log('data element missing');
    }
  }

  return dhis2DataElements;
};

/**
 * Get payload ids
 *
 * @param { DHIS2DataElement } payload -  payload.
 */
const getPayloadId = (payload: DHIS2DataElement[]): number[] => {
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
  DHIS2DataElement,
  getDHIS2DataElements,
  updateFailedDataElements,
  Where
};
