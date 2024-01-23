import { ApiProperty } from "@nestjs/swagger";

export class SchoolarshipDto {
  @ApiProperty()
  files: SchoolarshipFileDto[];

  @ApiProperty()
  schoolarship: Schoolarship[];
}

export class SchoolarshipFileDto {
  @ApiProperty({
    format: "uuid",
  })
  id: string;

  @ApiProperty({
    format: "date",
  })
  start_date: Date;

  @ApiProperty({
    format: "date",
  })
  end_date: Date;

  @ApiProperty()
  url: string;
}

export class Schoolarship {
  @ApiProperty({
    format: "uuid",
  })
  id: string;

  @ApiProperty({
    format: "date",
  })
  start_date: Date;

  @ApiProperty({
    format: "date",
  })
  end_date: Date;

  @ApiProperty()
  type: number;

  @ApiProperty()
  value: number;
}
