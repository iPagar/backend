import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { extractVkUserFromHeader } from "./vk-user.guard";
import { PrismaService } from "../../prisma.service";
import { Reflector } from "@nestjs/core";
import { Prisma, VkUser, students } from "@prisma/client";

export type StudentParamType = students & {
  VkUser: VkUser;
  vkUserId: string;
};

@Injectable()
export class StudentGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required =
      this.reflector.get<boolean>("isStudentRequired", context.getHandler()) ??
      true;
    const request = context.switchToHttp().getRequest();
    const vkUser = extractVkUserFromHeader(request);

    if (vkUser) {
      const student = await this.prisma.students.findFirst({
        where: {
          vkUserId: vkUser.vk_user_id,
        },
        include: {
          VkUser: true,
        },
      });

      if (!student || !student.VkUser) {
        if (required) {
          throw new UnauthorizedException();
        }

        return true;
      }

      request["student"] = student;
    } else {
      if (required) {
        throw new UnauthorizedException();
      }
    }

    return true;
  }
}
