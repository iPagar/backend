import { ApiProperty } from "@nestjs/swagger";

export class CommonCommentDto {
  @ApiProperty()
  comment: string;

  @ApiProperty({
    enum: ["public", "private"],
  })
  type: "public" | "private";

  @ApiProperty()
  my: boolean;
}

export class PublicCommentDto extends CommonCommentDto {
  type = "public" as const;

  @ApiProperty()
  vkId: number;
}

export class PrivateCommentDto extends CommonCommentDto {
  type = "private" as const;
}

export class PutCommentDto {
  @ApiProperty()
  comment: string;

  @ApiProperty()
  isPublic: boolean;
}
