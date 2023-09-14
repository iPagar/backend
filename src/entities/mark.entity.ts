import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { StudentEntity } from "./student.entity";
import { SemesterEntity } from "./semester.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity("marks")
export class MarkEntity {
  @PrimaryColumn()
  @ApiProperty({
    example: 123432,
  })
  id: number;

  @ManyToOne(() => StudentEntity)
  @JoinColumn({ name: "id" })
  student: StudentEntity;

  @PrimaryColumn({
    type: "varchar",
    length: 10,
    nullable: false,
  })
  @ApiProperty({
    example: "2020-весна",
  })
  semester: string;

  @ManyToOne(() => SemesterEntity)
  @JoinColumn({ name: "semester" })
  semesterEntity: SemesterEntity;

  @PrimaryColumn({ type: "varchar", length: 200, nullable: false })
  @ApiProperty({
    example: "Математика",
  })
  subject: string;

  @PrimaryColumn({ type: "varchar", length: 2, nullable: false })
  @ApiProperty({
    examples: ["Э", "М1"],
  })
  module: string;

  @Column({ type: "integer", nullable: false })
  @ApiProperty({
    example: 4.5,
  })
  value: number;

  @Column({ type: "double precision", nullable: false })
  @ApiProperty({
    example: 3.0,
  })
  factor: number;
}
