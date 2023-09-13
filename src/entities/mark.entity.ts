import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { StudentEntity } from "./student.entity";
import { SemesterEntity } from "./semester.entity";

@Entity("marks")
export class MarkEntity {
  @PrimaryColumn()
  id: number;

  @ManyToOne(() => StudentEntity)
  @JoinColumn({ name: "id" })
  student: StudentEntity;

  @PrimaryColumn({
    type: "varchar",
    length: 10,
    nullable: false,
  })
  semester: string;

  @ManyToOne(() => SemesterEntity)
  @JoinColumn({ name: "semester" })
  semesterEntity: SemesterEntity;

  @PrimaryColumn({ type: "varchar", length: 200, nullable: false })
  subject: string;

  @PrimaryColumn({ type: "varchar", length: 2, nullable: false })
  module: string;

  @Column({ type: "integer", nullable: false })
  value: number;

  @Column({ type: "double precision", nullable: false })
  factor: number;
}
