import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Migrationdataelements' })
export class MigrationDataElements {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public productId: number;

  @Column()
  public migrationId: number;

  @Column()
  public facilityId: number;

  @Column()
  public value: number;

  @Column()
  public dataElementCode: string;

  @Column()
  public organizationUnitCode: string;

  @Column()
  public isProcessed: boolean;
  @Column()
  public migratedAt?: Date;

  @Column()
  public reportingPeriod: string;

  @Column()
  public createdAt: Date;
}
