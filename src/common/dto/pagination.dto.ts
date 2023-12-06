import { applyDecorators } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class PaginationDto {
  @IsOptional()
  page = 1;

  @IsOptional()
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
