import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { StudentEntity } from "./student.entity";

@Entity("ratings")
export class RatingEntity {
  @PrimaryColumn()
  id: number;

  @PrimaryColumn({ type: "varchar", length: 10 })
  semester: string;

  @Column("double precision")
  rating: number;

  @ManyToOne(() => StudentEntity, (student) => student.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "id" })
  student: StudentEntity;
}
