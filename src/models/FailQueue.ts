import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'FailQueue' })
export class FailQueue {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public migrationId: number;

  @Column()
  public productId: number;

  @Column()
  public attempts: number;

  @Column()
  public createdAt: Date;
}
