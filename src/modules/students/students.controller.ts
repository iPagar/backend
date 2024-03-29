import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import {
  PersonalStudentRatingDto,
  StudentDto,
  StudentRatingDto,
} from "./dto/get-student.dto";
import { VkUserGuard, VkUser } from "../../common/guards/vk-user.guard";
import {
  UseVkUser,
  VkUserParam,
} from "../../common/decorators/vk-user.decorator";
import { LoginDto } from "./dto/login.dto";
import {
  LkMark,
  getMarks,
  getSemesters,
  getStudent,
} from "../../../services/lk";
import { Response } from "express";
import { DisabledGuard } from "../../common/guards/disabled.guard";
import {
  StudentGuard,
  StudentParamType,
} from "../../common/guards/student.guard";
import {
  StudentParam,
  UseStudent,
} from "../../common/decorators/student.decorator";
import { PrismaService } from "../../prisma.service";
import { getFilteredMarks, getRating } from "../../common/marks.helpers";
import { students } from "@prisma/client";
import {
  ApiPaginationQuery,
  PaginationDto,
} from "../../common/dto/pagination.dto";
import {
  PaginationResponseDto,
  paginationResponse,
} from "../../common/helpers/pagination.helper";
import db from "../../../services/queries";
import { vkService } from "../../common/utils/vk";

@Controller("students")
@ApiTags("Students")
@ApiExtraModels(StudentRatingDto)
export class StudentsController {
  constructor(private prisma: PrismaService) {}

  @Get("me")
  @ApiOkResponse({
    description: "Student retrieved successfully",
    type: StudentDto,
  })
  @UseVkUser()
  async getMe(@VkUserParam() vkUser: VkUser) {
    const foundStudent = await this.prisma.students.findFirst({
      where: {
        vkUserId: vkUser.vk_user_id,
      },
    });

    if (foundStudent) {
      const { password, ...rest } = foundStudent;
      // TODO: delete student after update
      return { ...rest, student: foundStudent.id };
    }

    throw new NotFoundException();
  }

  @Get()
  @ApiOkResponse({
    description: "Students retrieved successfully",
    schema: paginationResponse(StudentDto),
  })
  @ApiParam({
    name: "semester",
    description: "Semester to filter by",
    required: false,
  })
  @ApiPaginationQuery()
  @UseGuards(VkUserGuard)
  async getAll(
    @Query() paginationDto: PaginationDto,
    @Param("semester") semester?: string
  ): Promise<PaginationResponseDto<StudentDto>> {
    const { page, limit } = paginationDto;

    const students = await this.prisma.students.findMany({
      where: {
        marks: {
          some: {
            semester,
          },
        },
        VkUser: {
          isNot: null,
        },
      },
      include: {
        VkUser: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const filtered = students.map((student) => {
      const { password, ...rest } = student;

      return rest;
    });

    const vkUsers = await vkService.api.users.get({
      user_ids: filtered.map((student) => student.vkUserId),
      fields: ["photo_200"],
    });

    const richStudents = filtered.map((student) => {
      const vkUser = vkUsers.find(
        (vkUser) => vkUser.id.toString() === student.vkUserId
      );

      return {
        ...student,
        photo: vkUser?.photo_200,
        firstName: vkUser?.first_name,
        lastName: vkUser?.last_name,
        id: student.id,
      };
    });

    const total = await this.prisma.students.count({
      where: {
        marks: {
          some: {
            semester,
          },
        },
      },
    });

    return {
      data: richStudents,
      total,
    };
  }

  @Get("me/rating")
  @ApiOkResponse({
    description: "Student's rating retrieved successfully",
    type: PersonalStudentRatingDto,
  })
  @ApiQuery({
    name: "semester",
    description: "Semester to filter by",
  })
  @UseStudent()
  async getMeRating(
    @StudentParam() student: StudentParamType,
    @Query("semester") semester: string
  ): Promise<PersonalStudentRatingDto> {
    const rating = (await db.getStudentRatingAndNumberInTheListBySemester(
      student.id,
      semester
    )) as null | {
      rating: number;
      number: string;
      vkUserId: string;
    };

    const richByVk = await vkService.api.users.get({
      user_ids: [student.vkUserId],
      fields: ["photo_200"],
    });

    return {
      number: rating ? Number(rating.number) : null,
      photo: richByVk[0].photo_200,
    };
  }

  @Get("ratingst")
  @ApiQuery({
    name: "semester",
    description: "Semester to filter by",
    required: false,
  })
  @ApiOkResponse({
    description: "Students retrieved successfully",
    type: [StudentRatingDto],
  })
  @UseStudent()
  async getRatingst(
    @StudentParam() student: StudentDto,
    @Query("semester") semester: string
  ): Promise<StudentRatingDto[]> {
    const rating = (await db.getRatingStgroup(student.stgroup, semester)) as {
      number: string;
      id: number;
      rating: number;
      vkUserId: string;
    }[];

    const vkUsers = await vkService.api.users.get({
      user_ids: rating.map((student) => student.vkUserId),
      fields: ["photo_200"],
    });

    const richStudents = rating.map((student) => {
      const vkUser = vkUsers.find(
        (vkUser) => vkUser.id.toString() === student.vkUserId
      );

      return {
        ...student,
        photo: vkUser?.photo_200 ?? null,
        firstName: vkUser?.first_name ?? null,
        lastName: vkUser?.last_name ?? null,
        stgroup: student.number,
      };
    });

    return richStudents;
  }

  @Get("rating")
  @ApiPaginationQuery()
  @ApiQuery({
    name: "search",
    description: "Search by student's name",
    required: false,
  })
  @ApiQuery({
    name: "semester",
    description: "Semester to filter by",
    required: false,
  })
  @ApiOkResponse({
    description: "Students retrieved successfully",
    schema: paginationResponse(StudentRatingDto),
  })
  async getRating(
    @Query() paginationDto: PaginationDto,
    @Query("semester") semester: string,
    @Query("search") search = ""
  ): Promise<PaginationResponseDto<StudentRatingDto>> {
    const { page, limit } = paginationDto;

    const rating = (await db.getRating(semester, search, page, limit)) as {
      data: {
        number: string;
        id: number;
        stgroup: string;
        rating: number;
        vkUserId: string;
      }[];
      total: number;
    };

    const vkUsers = await vkService.api.users.get({
      user_ids: rating.data.map((student) => student.vkUserId),
      fields: ["photo_200"],
    });

    const richStudents = rating.data.map((student) => {
      const vkUser = vkUsers.find(
        (vkUser) => vkUser.id.toString() === student.vkUserId
      );

      return {
        ...student,
        photo: vkUser?.photo_200 ?? null,
        firstName: vkUser?.first_name ?? null,
        lastName: vkUser?.last_name ?? null,
      };
    });

    return {
      data: richStudents,
      total: rating.total,
    };
  }

  @Post("login")
  @ApiBody({
    description: "Student's id and password",
    type: LoginDto,
  })
  @ApiOkResponse({ description: "Student logged in successfully" })
  @UseVkUser()
  async login(@VkUserParam() vkUser: VkUser, @Body() loginDto: LoginDto) {
    const lkStudent = await getStudent(
      Number(loginDto.studentId),
      loginDto.password
    );
    const { surname, initials, stgroup } = lkStudent;

    const foundStudent = await this.prisma.students.findUnique({
      where: {
        id: Number(loginDto.studentId),
      },
    });

    if (foundStudent) {
      await this.prisma.students.update({
        where: {
          id: Number(loginDto.studentId),
        },
        data: {
          vkUserId: vkUser.vk_user_id,
        },
      });
    } else {
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
            surname,
            initials,
            stgroup,
            id: Number(loginDto.studentId),
            password: loginDto.password,
            VkUser: {
              connectOrCreate: {
                where: {
                  id: vkUser.vk_user_id,
                },
                create: {
                  id: vkUser.vk_user_id,
                },
              },
            },
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
              studentId: createdStudent.id,
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
              student: { id: createdStudent.id },
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

        const { password, ...rest } = createdStudent;

        return rest;
      });
    }
  }

  @Post("logout")
  @ApiOkResponse({ description: "Student logged out successfully" })
  @UseVkUser()
  async logout(@VkUserParam() vkUser: VkUser, @Res() res: Response) {
    const foundVkUser = await this.prisma.vkUser.findUnique({
      where: {
        id: vkUser.vk_user_id,
      },
    });

    if (!foundVkUser) {
      throw new NotFoundException();
    }

    const foundStudent = await this.prisma.students.findFirst({
      where: {
        vkUserId: vkUser.vk_user_id,
      },
    });

    if (!foundStudent) {
      throw new NotFoundException();
    }

    await this.prisma.students.update({
      where: {
        id: foundStudent.id,
      },
      data: {
        vkUserId: null,
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
  async getStudentSemesters(@StudentParam() student: StudentParamType) {
    const data = await this.prisma.marks.findMany({
      where: {
        studentId: student.id,
      },
      select: {
        semester: true,
      },
      distinct: ["semester"],
    });

    return data
      .map((mark) => mark.semester)
      .sort((a, b) => {
        // Разделяем строку на год и сезон
        let partsA = a.split("-");
        let partsB = b.split("-");

        // Сравниваем годы
        if (partsA[0] !== partsB[0]) {
          return Number(partsA[0]) - Number(partsB[0]);
        }

        // Если годы одинаковые, сравниваем сезоны (весна перед осенью)
        return partsA[1] === "весна" ? -1 : 1;
      });
  }

  @Get(":id")
  @ApiOkResponse({
    description: "Student retrieved successfully",
    type: StudentDto,
  })
  @UseGuards(DisabledGuard)
  async getOne(@Param("id") id: number) {
    const student = await this.prisma.students.findUnique({
      where: {
        id: id,
      },
    });

    if (student) {
      const { password, ...rest } = student;
      return { ...rest };
    }

    throw new NotFoundException();
  }
}
