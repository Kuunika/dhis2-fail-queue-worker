import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Failqueue' })
export class FailQueue {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public migrationId: number;

  @Column()
  public dataElementCode: string;

  @Column()
  public attempts: number;

  @Column()
  public createdAt: Date;
}
