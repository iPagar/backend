import { ApiProperty, ApiResponse } from "@nestjs/swagger";
import { IsString, Length, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({
    description: "Student's id",
    example: 235873,
  })
  @IsString()
  @Length(6, 6)
  studentId: string;

  @ApiProperty()
  @IsString()
  password: string;
}
