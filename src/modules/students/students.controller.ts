import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { StudentEntity } from "../../entities/student.entity";
import { ApiBody, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { GetStudentDto } from "./dto/get-student.dto";
import { VkUserGuard, VkUser } from "../../common/guards/vk-user.guard";
import { VkUserParam } from "../../common/decorators/vk-user.decorator";
import { LoginDto } from "./dto/login.dto";
import {
  LkMark,
  getMarks,
  getSemesters,
  getStudent,
} from "../../../services/lk";
import { Response } from "express";
import { DisabledGuard } from "../../common/guards/disabled.guard";
import { StudentGuard } from "../../common/guards/student.guard";
import { StudentParam } from "../../common/decorators/student.decorator";
import { PrismaService } from "../../prisma.service";
import { getFilteredMarks, getRating } from "../../common/marks.helpers";

@Controller("students")
@ApiTags("Students")
export class StudentsController {
  constructor(private prisma: PrismaService) {}

  @Get("me")
  @ApiOkResponse({
    description: "Student retrieved successfully",
    type: GetStudentDto,
  })
  @UseGuards(VkUserGuard)
  async getMe(@VkUserParam() vkUser: VkUser) {
    const foundStudent = await this.prisma.students.findUnique({
      where: {
        id: Number(vkUser.vk_user_id),
      },
    });

    if (foundStudent) {
      return foundStudent;
    }

    throw new NotFoundException();
  }

  @Get()
  @ApiOkResponse({
    description: "Students retrieved successfully",
    type: [GetStudentDto],
  })
  @UseGuards(DisabledGuard)
  getAll() {
    return this.prisma.students.findMany();
  }

  @Post("login")
  @ApiBody({
    description: "Student's id and password",
    type: LoginDto,
  })
  @ApiOkResponse({ description: "Student logged in successfully" })
  @UseGuards(VkUserGuard)
  async login(@VkUserParam() vkUser: VkUser, @Body() loginDto: LoginDto) {
    try {
      const lkStudent = await getStudent(
        Number(loginDto.studentId),
        loginDto.password
      );
      const { surname, initials, stgroup } = lkStudent;

      const semesters = await getSemesters(
        Number(loginDto.studentId),
        loginDto.password
      );
      const semesterEntities = semesters.map((semester) => ({
        semester,
      }));

      const markGroups: {
        marks: LkMark[];
        semester: string;
      }[] = (
        await Promise.all(
          semesters.map(async (semester) => {
            return {
              marks: await getMarks(
                Number(loginDto.studentId),
                loginDto.password,
                semester
              ),
              semester,
            };
          })
        )
      ).flat();

      return await this.prisma.$transaction(async (tx) => {
        const createdStudent = await tx.students.create({
          data: {
            id: Number(vkUser.vk_user_id),
            surname,
            initials,
            stgroup,
            student: Number(loginDto.studentId),
            password: loginDto.password,
          },
        });

        await tx.semesters.createMany({
          data: semesterEntities,
          skipDuplicates: true,
        });

        const markEntities = markGroups
          .map((markGroup) =>
            markGroup.marks.map((mark) => ({
              subject: mark.title,
              value: mark.value,
              factor: mark.factor,
              module: mark.num,
              semester: markGroup.semester,
              id: createdStudent.id,
            }))
          )
          .flat();

        await tx.marks.createMany({
          data: markEntities,
        });

        for (const makrGroup of markGroups) {
          const marks = await tx.marks.findMany({
            where: {
              semester: makrGroup.semester,
              students: { id: createdStudent.id },
            },
          });

          const filteredMarks = getFilteredMarks(marks);
          const rating = getRating(filteredMarks);

          if (rating) {
            await tx.ratings.create({
              data: {
                rating,
                semester: makrGroup.semester,
                id: createdStudent.id,
              },
            });
          } else {
            await tx.ratings.deleteMany({
              where: {
                semester: makrGroup.semester,
                students: { id: createdStudent.id },
              },
            });
          }
        }

        return createdStudent;
      });
    } catch (error) {
      console.log(error);
    }
  }

  @Post("logout")
  @ApiOkResponse({ description: "Student logged out successfully" })
  @UseGuards(VkUserGuard)
  async logout(@VkUserParam() vkUser: VkUser, @Res() res: Response) {
    await this.prisma.students.delete({
      where: {
        id: Number(vkUser.vk_user_id),
      },
    });

    res.status(200).send();
  }

  @Get("semesters")
  @ApiOkResponse({
    description: "Student's semesters retrieved successfully",
    type: [String],
  })
  @UseGuards(StudentGuard)
  async getStudentSemesters(@StudentParam() student: StudentEntity) {
    const data = await this.prisma.marks.findMany({
      where: {
        students: {
          id: student.id,
        },
      },
      select: {
        semester: true,
      },
      distinct: ["semester"],
    });

    return data.map((mark) => mark.semester);
  }

  @Get(":id")
  @ApiOkResponse({
    description: "Student retrieved successfully",
    type: GetStudentDto,
  })
  @UseGuards(DisabledGuard)
  getOne(@Param("id") id: number) {
    return this.prisma.students.findUnique({
      where: {
        id,
      },
    });
  }
}
