import { UseGuards, applyDecorators } from "@nestjs/common";
import { AdminGuard } from "../guards/admin.guard";
import { ApiBearerAuth } from "@nestjs/swagger";

export function UseAdmin() {
  return applyDecorators(
    UseGuards(AdminGuard),
    ApiBearerAuth("Authorization-Admin")
  );
}
