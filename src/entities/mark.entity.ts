import { ApiProperty } from "@nestjs/swagger";

export class MarkEntity {
  @ApiProperty({
    example: 123432,
  })
  id: number;

  @ApiProperty({
    example: "2020-весна",
  })
  semester: string;

  @ApiProperty({
    example: "Математика",
  })
  subject: string;

  @ApiProperty({
    examples: ["Э", "М1"],
  })
  module: string;

  @ApiProperty({
    example: 4.5,
  })
  value: number;

  @ApiProperty({
    example: 3.0,
  })
  factor: number;
}
