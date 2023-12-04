import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsInt, Min, Max } from "class-validator";

export class PutReactionDto {
  @ApiProperty({
    description: "Teacher's id",
    type: String,
  })
  @IsUUID()
  teacherId: string;

  @ApiProperty({
    description: "Reaction to put",
    type: Number,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  reaction: number;
}
