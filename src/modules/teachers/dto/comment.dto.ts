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

  @ApiProperty()
  createdAt: Date;
}

export class PublicCommentDto extends CommonCommentDto {
  @ApiProperty({
    enum: ["public"],
  })
  type = "public" as const;

  @ApiProperty()
  vkId: number;
}

export class PrivateCommentDto extends CommonCommentDto {
  @ApiProperty({
    enum: ["private"],
  })
  type = "private" as const;
}

export class PutCommentDto {
  @ApiProperty()
  comment: string;

  @ApiProperty()
  isPublic: boolean;
}
