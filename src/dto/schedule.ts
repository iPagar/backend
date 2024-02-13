import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

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

  @ApiProperty({
    enum: ["spring", "autumn"],
  })
  @IsEnum(["spring", "autumn"])
  season: "spring" | "autumn";

  @ApiProperty()
  year: number;
}
