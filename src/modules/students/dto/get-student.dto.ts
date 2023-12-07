import { ApiProperty } from "@nestjs/swagger";

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

export class PersonalStudentRatingDto {
  @ApiProperty({
    type: String,
    nullable: true,
  })
  number: number | null;

  @ApiProperty({
    type: String,
    nullable: true,
  })
  photo: string | null;
}

export class StudentRatingDto {
  @ApiProperty()
  number: string;

  @ApiProperty()
  id: number;

  @ApiProperty({
    type: String,
    nullable: true,
  })
  stgroup: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
  })
  rating: number | null;

  @ApiProperty({
    type: String,
    nullable: true,
  })
  photo: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
  })
  firstName: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
  })
  lastName: string | null;
}
