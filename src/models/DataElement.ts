import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "DataElement" })
export class DataElement {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public dataSetId: number;

  @Column()
  public dataElementId: string;

  @Column()
  public dataElementName: string;
}
