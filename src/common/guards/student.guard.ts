import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { StudentEntity } from "../../entities/student.entity";
import { Repository } from "typeorm";
import { extractVkUserFromHeader } from "./vk-user.guard";
import { PrismaService } from "../../prisma.service";
import { Reflector } from "@nestjs/core";

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
      const student = await this.prisma.students.findUnique({
        where: {
          id: Number(vkUser.vk_user_id),
        },
      });

      if (!student) {
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
