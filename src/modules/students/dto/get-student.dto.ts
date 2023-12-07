import { ApiProperty, OmitType } from "@nestjs/swagger";
import { StudentEntity } from "../../../entities/student.entity";

export class StudentDto {
  @ApiProperty({
    format: "int32",
    example: 12374382,
  })
  id: number;

  @ApiProperty({
    format: "int32",
    example: 152743,
  })
  student: number;

  @ApiProperty({
    format: "string",
    example: "Иван",
    nullable: true,
  })
  surname: string | null;

  @ApiProperty({
    format: "string",
    example: "П.А.",
    nullable: true,
  })
  initials: string | null;

  @ApiProperty({
    format: "string",
    example: "АДБ-20-01",
    nullable: true,
  })
  stgroup: string | null;

  @ApiProperty({
    format: "boolean",
    example: false,
    nullable: true,
  })
  notify: boolean | null;

  @ApiProperty({
    format: "boolean",
    example: false,
  })
  is_deleted: boolean;
}

export class StudentRatingDto {
  @ApiProperty()
  number: string;

  @ApiProperty()
  id: string;

  @ApiProperty()
  stgroup: string;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  photo: string | null;

  @ApiProperty()
  firstName: string | null;

  @ApiProperty()
  lastName: string | null;
}
