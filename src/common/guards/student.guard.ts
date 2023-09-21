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

@Injectable()
export class StudentGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const vkUser = extractVkUserFromHeader(request);

    if (vkUser) {
      const student = await this.prisma.students.findUnique({
        where: {
          id: Number(vkUser.vk_user_id),
        },
      });
      if (!student) {
        throw new UnauthorizedException();
      }
      request["student"] = student;
    }

    return true;
  }
}
