import { applyDecorators } from "@nestjs/common";
import { ApiProperty, ApiQuery } from "@nestjs/swagger";
import { IsOptional, IsNumber, Min } from "class-validator";

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit = 10;
}

export function ApiPaginationQuery() {
  return applyDecorators(
    ApiQuery({
      name: "page",
      type: Number,
      required: false,
      description: "Page number",
    }),
    ApiQuery({
      name: "limit",
      type: Number,
      required: false,
      description: "Items per page",
    })
  );
}
