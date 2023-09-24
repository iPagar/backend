import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../../prisma.service";
import { getTeachersFromWebsite } from "./teachers.helpers";
import { Cron } from "@nestjs/schedule";

@Controller("teachers")
@ApiTags("Teachers")
export class TeachersController {
  constructor(private prismaService: PrismaService) {}

  @Get()
  getTeachers() {
    return this.prismaService.teachers.findMany();
  }

  // every week
  @Cron("0 0 * * 1")
  async updateTeachers() {
    const teachers = await getTeachersFromWebsite();
    const filteredTeachers: {
      name: string;
      position: string;
      qualification: string;
      subjects: string;
    }[] = teachers.map((teacher) => ({
      name: teacher.name,
      position: teacher.position,
      qualification: teacher.qualification,
      subjects: teacher.disciplines,
    }));

    await this.prismaService.$transaction(
      async (tx) => {
        const inactive = await tx.teachers.findMany({
          where: {
            name: {
              notIn: filteredTeachers.map((teacher) => teacher.name),
            },
          },
        });

        await tx.teachers.updateMany({
          where: {
            id: {
              in: inactive.map((teacher) => teacher.id),
            },
          },
          data: {
            status: "inactive",
          },
        });

        const active = await tx.teachers.findMany({
          where: {
            name: {
              in: filteredTeachers.map((teacher) => teacher.name),
            },
          },
        });

        const update = filteredTeachers.filter((teacher) =>
          active.find((activeTeacher) => activeTeacher.name === teacher.name)
        );

        const updatePromises = update.map(async (teacher) => {
          await tx.teachers.update({
            where: {
              name: teacher.name,
            },
            data: {
              name: teacher.name,
              position: teacher.position,
              qualification: teacher.qualification,
              subjects: teacher.subjects,
              status: "active",
            },
          });
        });

        await Promise.all(updatePromises);

        const newTeachers = filteredTeachers.filter(
          (teacher) =>
            !active.find(
              (activeTeacher) => activeTeacher.name === teacher.name
            ) &&
            !inactive.find(
              (inactiveTeacher) => inactiveTeacher.name === teacher.name
            )
        );

        await tx.teachers.createMany({
          data: newTeachers,
        });
      },
      {
        timeout: 50000,
      }
    );
  }
}
