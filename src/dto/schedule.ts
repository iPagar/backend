import { ApiProperty } from "@nestjs/swagger";

export class UpdateCourseDto {
  @ApiProperty()
  courseExp: string;

  @ApiProperty()
  folderExp: string;
}

export class UpdateScheduleDto {
  @ApiProperty({
    type: [UpdateCourseDto],
  })
  steps: UpdateCourseDto[];
}
