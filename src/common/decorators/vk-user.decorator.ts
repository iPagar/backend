import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  UseGuards,
} from "@nestjs/common";
import { VkUser, VkUserGuard } from "../guards/vk-user.guard";
import { ApiBearerAuth } from "@nestjs/swagger";

export const VkUserParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.vkUser as VkUser;
  }
);

export function UseVkUser() {
  return applyDecorators(
    UseGuards(VkUserGuard),
    ApiBearerAuth("Authorization")
  );
}
