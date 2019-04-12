import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Migration' })
export class Migration {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public uploadedAt: Date;

  @Column()
  public structureValidatedAt: Date;

  @Column()
  public structureFailedValidationAt: Date;

  @Column()
  public elementsAuthorizationAt: Date;

  @Column()
  public elementsFailedAuthorizationAt: Date;

  @Column()
  public valuesValidatedAt: Date;

  @Column()
  public valuesFailedValidationAt: Date;

  @Column()
  public reportDispatchedAt: Date;

  @Column()
  public totalMigratedElements: number;

  @Column()
  public totalDataElements: number;

  @Column()
  public totalFailedElements: number;

  @Column()
  public migrationCompletedAt: Date;

  @Column()
  public clientId: number;

  @Column()
  public createdAt: Date;
}
