import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from "@nestjs/common";
import { StudentGuard, StudentParamType } from "../guards/student.guard";
import { ApiBearerAuth } from "@nestjs/swagger";

export const StudentParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.student as StudentParamType;
  }
);

export function UseStudent(
  props = {
    required: true,
  }
) {
  return applyDecorators(
    SetMetadata("isStudentRequired", props.required),
    UseGuards(StudentGuard),
    ApiBearerAuth("Authorization")
  );
}
