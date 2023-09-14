import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { StudentEntity } from "./student.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity("ratings")
export class RatingEntity {
  @PrimaryColumn()
  @ApiProperty({
    example: 123432,
  })
  id: number;

  @PrimaryColumn({ type: "varchar", length: 10 })
  @ApiProperty({
    example: "2020-весна",
  })
  semester: string;

  @Column("double precision")
  @ApiProperty({
    example: 4.5,
  })
  rating: number;

  @ManyToOne(() => StudentEntity, (student) => student.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "id" })
  student: StudentEntity;
}
