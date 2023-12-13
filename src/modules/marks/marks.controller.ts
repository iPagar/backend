import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { MarkEntity } from "../../entities/mark.entity";
import {
  StudentGuard,
  StudentParamType,
} from "../../common/guards/student.guard";
import {
  StudentParam,
  UseStudent,
} from "../../common/decorators/student.decorator";
import { PrismaService } from "../../prisma.service";

@Controller("marks")
@ApiTags("Marks")
export class MarksController {
  constructor(private prisma: PrismaService) {}

  @Get("/notify")
  @UseGuards(StudentGuard)
  @ApiOkResponse({
    description: "Returns true if student has notifications enabled",
    type: Boolean,
  })
  notify(@StudentParam() student: StudentParamType) {
    return student.VkUser.notify;
  }

  @Post("/notify")
  @UseStudent()
  @ApiOkResponse({
    description: "Switch notifications for student",
    type: Boolean,
  })
  async switchNotify(@StudentParam() student: StudentParamType) {
    student.notify = !student.notify;
    await this.prisma.vkUser.update({
      where: {
        id: student.VkUser.id,
      },
      data: {
        notify: student.notify,
      },
    });

    return student.VkUser.notify;
  }

  @Get(":semester")
  @UseStudent()
  @ApiOkResponse({
    description: "Returns marks for student for given semester",
    type: [MarkEntity],
  })
  async getSemesterMarks(
    @StudentParam() student: StudentParamType,
    @Param("semester") semester: string
  ) {
    return this.prisma.marks.findMany({
      where: {
        student: {
          id: student.id,
        },
        semester,
      },
    });
  }
}
