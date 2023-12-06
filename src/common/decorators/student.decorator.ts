import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
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
