import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "FailQueue" })
export class FailQueue {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public organizationUnitCode: string;

  @Column()
  public dataElementId: number;

  @Column()
  public migrationId: number;

  @Column()
  public value: number;

  @Column()
  public isProcessed: boolean;

  @Column()
  public isMigrated: boolean;

  @Column()
  public period: string;

  @Column()
  public attempts: number;

  @Column()
  public migratedAt: string;
}
