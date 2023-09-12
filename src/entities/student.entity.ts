import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("students")
export class StudentEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    format: "int32",
    example: 12374382,
  })
  id: number;

  @Column({ type: "integer" })
  @ApiProperty({
    format: "int32",
    example: 152743,
  })
  student: number;

  @Column({ type: "character varying", length: 30, select: false })
  @Exclude()
  password: string;

  @Column({ type: "character varying", length: 30 })
  @ApiProperty({
    format: "string",
    example: "Иван",
  })
  surname: string;

  @Column({ type: "character varying", length: 30 })
  @ApiProperty({
    format: "string",
    example: "П.А.",
  })
  initials: string;

  @Column({ type: "character varying", length: 30 })
  @ApiProperty({
    format: "string",
    example: "АДБ-20-01",
  })
  stgroup: string;

  @Column({ type: "boolean", default: false })
  @ApiProperty({
    format: "boolean",
    example: false,
  })
  notify: boolean;

  @Column({ type: "boolean", default: false })
  @ApiProperty({
    format: "boolean",
    example: false,
  })
  is_deleted: boolean;
}
