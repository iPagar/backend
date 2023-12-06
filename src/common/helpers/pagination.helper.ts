import { getSchemaPath } from "@nestjs/swagger";
import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

export function paginationResponse<T>(dtoClass: new () => T): SchemaObject {
  // Формируем схему
  return {
    type: "object",
    properties: {
      data: {
        type: "array",
        items: {
          $ref: getSchemaPath(dtoClass),
        },
      },
      total: {
        type: "number",
      },
    },
    required: ["data", "total"],
  } as SchemaObject;
}

export class PaginationResponseDto<T> {
  data: T[];
  total: number;
}
