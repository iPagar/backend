import { ApiProperty } from "@nestjs/swagger";
import {
  IsUUID,
  IsString,
  IsDateString,
  IsObject,
  IsBoolean,
  IsNumber,
  IsOptional,
  ValidateNested,
} from "class-validator";

class ReactionsDto {
  @ApiProperty()
  @IsNumber()
  count: number;

  @ApiProperty()
  @IsObject()
  data: Record<string, number>;

  @ApiProperty({ type: Number, nullable: true })
  @IsOptional()
  my: number | null;
}

class CommentsDto {
  @ApiProperty()
  @IsNumber()
  count: number;

  @ApiProperty()
  @IsBoolean()
  my: boolean;
}

export class TeacherDto {
  @IsUUID()
  @ApiProperty({
    format: "uuid",
  })
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  position: string;

  @ApiProperty()
  @IsString()
  qualification: string;

  @ApiProperty()
  @IsDateString()
  updatedAt: Date;

  @ApiProperty()
  @IsDateString()
  createdAt: Date;

  @ApiProperty()
  @IsString()
  subjects: string;

  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty({ type: ReactionsDto })
  @IsObject()
  reactions: ReactionsDto;

  @ApiProperty({ type: CommentsDto })
  @IsObject()
  comments: CommentsDto;

  @ApiProperty()
  @IsObject()
  details: Record<string, string | number | undefined>;
}
