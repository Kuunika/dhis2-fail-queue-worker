import { MigrationDataElements } from '../../models';
import { DHIS2DataElement } from '..';

export const generateDHIS2Payload = async (
  migrationDataElements: MigrationDataElements[]
): Promise<[DHIS2DataElement[], number[]]> => {
  const dhis2DataElements: DHIS2DataElement[] = [];
  const migrationDataElementsIds: number[] = [];

  for (const migrationDataElement of migrationDataElements) {
    const {
      id,
      value,
      dataElementCode,
      organizationUnitCode,
      reportingPeriod,
    } = migrationDataElement;

    await migrationDataElementsIds.push(id);

    await dhis2DataElements.push({
      dataElement: dataElementCode,
      orgUnit: organizationUnitCode,
      period: reportingPeriod,
      value,
    });
  }

  return [dhis2DataElements, migrationDataElementsIds];
};
