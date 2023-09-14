import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from "typeorm";

@Entity("semesters")
export class SemesterEntity {
  @PrimaryColumn({ type: "varchar", length: 30, nullable: false })
  @ApiProperty({
    example: "2020-весна",
  })
  semester: string;
}
