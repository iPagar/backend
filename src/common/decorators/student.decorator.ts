import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  UseGuards,
} from "@nestjs/common";
import { StudentEntity } from "../../entities/student.entity";
import { StudentGuard } from "../guards/student.guard";
import { ApiBearerAuth, ApiHeader } from "@nestjs/swagger";

export const StudentParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.student as StudentEntity;
  }
);

export function UseStudent() {
  return applyDecorators(
    UseGuards(StudentGuard),
    ApiBearerAuth("Authorization")
  );
}
