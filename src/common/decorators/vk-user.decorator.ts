import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { OmitType } from "@nestjs/swagger";
import { StudentEntity } from "../../entities/student.entity";

export const VkUserParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.vkUser;
  }
);
