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

  @ApiProperty({ required: false, type: Number })
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
  @ApiProperty()
  @IsUUID()
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
  updatedAt: string;

  @ApiProperty()
  @IsDateString()
  createdAt: string;

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
  details: Record<string, number>;
}
