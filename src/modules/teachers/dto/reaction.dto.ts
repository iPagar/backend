import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsInt, Min, Max } from "class-validator";

export class PutReactionDto {
  @ApiProperty({
    description: "Reaction to put",
    type: Number,
  })
  @IsInt()
  @Min(1)
  @Max(7)
  reaction: number;
}
