import { ApiProperty } from "@nestjs/swagger";

export class GetStudentScheduleDto {
  @ApiProperty({
    example: "2024-02-12",
    description: "Date in format YYYY-MM-DD",
  })
  date: string;
}
