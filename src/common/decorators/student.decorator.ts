import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { StudentEntity } from "../../entities/student.entity";

export const StudentParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.student as StudentEntity;
  }
);
