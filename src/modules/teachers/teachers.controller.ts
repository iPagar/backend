import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Put,
  Query,
} from "@nestjs/common";
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from "@nestjs/swagger";
import { PrismaService } from "../../prisma.service";
import { getTeachersFromWebsite } from "./teachers.helpers";
import { Cron } from "@nestjs/schedule";
import {
  StudentParam,
  UseStudent,
} from "../../common/decorators/student.decorator";
import { StudentEntity } from "../../entities/student.entity";
import { PutReactionDto } from "./dto/reaction.dto";
import { getTeacherDetail } from "./utils/get-teacher-details";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { ApiPaginationQuery } from "../../common/dto/pagination.dto";
import {
  PrivateCommentDto,
  PublicCommentDto,
  PutCommentDto,
} from "./dto/comment.dto";
import { TeacherDto } from "./dto/teacher.dto";

@Controller("teachers")
@ApiTags("Teachers")
@ApiExtraModels(PublicCommentDto, PrivateCommentDto)
export class TeachersController {
  constructor(private prismaService: PrismaService) {}

  @Put(":teacherId/reactions")
  @UseStudent()
  @ApiOkResponse({
    description: "Reaction was successfully updated",
  })
  async putReaction(
    @StudentParam() student: StudentEntity,
    @Body() body: PutReactionDto,
    @Param("teacherId") teacherId: string
  ) {
    const { reaction } = body;

    const foundTeacher = await this.prismaService.teachers.findUnique({
      where: {
        id: teacherId,
      },
    });

    if (!foundTeacher) {
      throw new NotFoundException();
    }

    const foundReaction = await this.prismaService.teachers_reactions.findFirst(
      {
        where: {
          teachers: {
            id: teacherId,
          },
          students: {
            id: student.id,
          },
        },
      }
    );

    if (foundReaction) {
      await this.prismaService.teachers_reactions.update({
        where: {
          id_name: {
            id: foundReaction.id,
            name: foundReaction.name,
          },
        },
        data: {
          reaction,
        },
      });
    } else {
      await this.prismaService.teachers_reactions.create({
        data: {
          reaction,
          teachers: {
            connect: {
              id: teacherId,
            },
          },
          students: {
            connect: {
              id: student.id,
            },
          },
        },
      });
    }
  }

  @Delete(":teacherId/reactions")
  @ApiOkResponse({
    description: "Reaction was successfully deleted",
  })
  @UseStudent()
  async deleteReaction(
    @StudentParam() student: StudentEntity,
    @Param("teacherId") teacherId: string
  ) {
    const foundTeacher = await this.prismaService.teachers.findUnique({
      where: {
        id: teacherId,
      },
    });

    if (!foundTeacher) {
      throw new NotFoundException();
    }

    const foundReaction = await this.prismaService.teachers_reactions.findFirst(
      {
        where: {
          teachers: {
            id: teacherId,
          },
          students: {
            id: student.id,
          },
        },
      }
    );

    if (foundReaction) {
      await this.prismaService.teachers_reactions.delete({
        where: {
          id_name: {
            id: foundReaction.id,
            name: foundReaction.name,
          },
        },
      });
    }
  }

  @Get(":teacherId/comments")
  @UseStudent({
    required: false,
  })
  @ApiOkResponse({
    description: "List of comments",
    schema: {
      items: {
        oneOf: [
          {
            $ref: getSchemaPath(PublicCommentDto),
          },
          {
            $ref: getSchemaPath(PrivateCommentDto),
          },
        ],
      },
    },
  })
  async getComments(
    @Param("teacherId") teacherId: string,
    @StudentParam() student?: StudentEntity
  ): Promise<(PublicCommentDto | PrivateCommentDto)[]> {
    const foundTeacher = await this.prismaService.teachers.findUnique({
      where: {
        id: teacherId,
      },
    });

    if (!foundTeacher) {
      throw new NotFoundException();
    }

    const comments = await this.prismaService.teachers_comments.findMany({
      where: {
        teachers: {
          id: teacherId,
        },
      },
      include: {
        students: true,
      },
    });

    const richByMy = comments.map((comment) => ({
      ...comment,
      my: student ? comment.students.id === student.id : false,
    }));
    const formatted = richByMy.map((comment) => {
      if (comment.is_public) {
        return {
          comment: comment.comment,
          vkId: comment.id,
          my: comment.my,
          type: "public",
          createdAt: comment.created_at,
        } satisfies PublicCommentDto;
      } else {
        return {
          comment: comment.comment,
          my: comment.my,
          type: "private",
          createdAt: comment.created_at,
        } satisfies PrivateCommentDto;
      }
    });

    return formatted;
  }

  @Put(":teacherId/comments")
  @UseStudent()
  @ApiOkResponse({
    description: "Comment was successfully updated",
  })
  async putComment(
    @StudentParam() student: StudentEntity,
    @Param("teacherId") teacherId: string,
    @Body() body: PutCommentDto
  ) {
    const foundTeacher = await this.prismaService.teachers.findUnique({
      where: {
        id: teacherId,
      },
    });

    if (!foundTeacher) {
      throw new NotFoundException();
    }

    const foundComment = await this.prismaService.teachers_comments.findFirst({
      where: {
        students: {
          id: student.id,
        },
        teachers: {
          id: teacherId,
        },
      },
    });

    if (foundComment) {
      await this.prismaService.teachers_comments.update({
        where: {
          id_name: {
            id: foundComment.id,
            name: foundComment.name,
          },
        },
        data: {
          comment: body.comment,
          is_public: body.isPublic,
        },
      });
    } else {
      await this.prismaService.teachers_comments.create({
        data: {
          comment: body.comment,
          is_public: body.isPublic,
          id: student.id,
          name: foundTeacher.name,
        },
      });
    }
  }

  @Delete(":teacherId/comments")
  @UseStudent()
  @ApiOkResponse({
    description: "Comment was successfully deleted",
  })
  async deleteComment(
    @StudentParam() student: StudentEntity,
    @Param("teacherId") teacherId: string
  ) {
    const foundTeacher = await this.prismaService.teachers.findUnique({
      where: {
        id: teacherId,
      },
    });

    if (!foundTeacher) {
      throw new NotFoundException();
    }

    const foundComment = await this.prismaService.teachers_comments.findFirst({
      where: {
        teachers: {
          id: teacherId,
        },
        students: {
          id: student.id,
        },
      },
    });

    if (!foundComment) {
      throw new NotFoundException();
    }

    await this.prismaService.teachers_comments.delete({
      where: {
        id_name: {
          id: foundComment.id,
          name: foundComment.name,
        },
      },
    });
  }

  @Get()
  @UseStudent({
    required: false,
  })
  @ApiPaginationQuery()
  @ApiQuery({
    name: "name",
    type: String,
    required: false,
    description: "Teacher name",
  })
  @ApiOkResponse({
    description: "List of teachers",
    type: [TeacherDto],
  })
  async getTeachers(
    @Query() paginationDto: PaginationDto,
    @Query("name") name?: string,
    @StudentParam() student?: StudentEntity
  ): Promise<TeacherDto[]> {
    const { page, limit } = paginationDto;
    const teachers = await this.prismaService.$transaction(
      async (tx) => {
        const teachers = await tx.teachers.findMany({
          where: {
            status: "active",
            name: {
              contains: name,
              mode: "insensitive",
            },
          },
        });
        const reactions = await tx.teachers_reactions.findMany({
          where: {
            teachers: {
              id: {
                in: teachers.map((teacher) => teacher.id),
              },
            },
          },
          include: {
            teachers: true,
            students: true,
          },
        });
        const comments = await tx.teachers_comments.findMany({
          where: {
            teachers: {
              id: {
                in: teachers.map((teacher) => teacher.id),
              },
            },
          },
          include: {
            teachers: true,
            students: true,
          },
        });
        const richByReactions = teachers.map((teacher) => {
          const teacherReactions = reactions.filter(
            (reaction) => reaction.teachers.id === teacher.id
          );
          const richByReactions = teacherReactions.reduce(
            (
              acc: {
                count: number;
                data: {
                  [key: string]: number;
                };
              },
              reaction
            ) => {
              const reactionName = reaction.reaction;

              return {
                ...acc,
                data: {
                  ...acc.data,
                  [reaction.reaction]:
                    reactionName in acc.data ? acc.data[reactionName] + 1 : 1,
                },
                count: acc.count + 1,
                my: student
                  ? reaction.students.id === student.id
                    ? reactionName
                    : null
                  : null,
              };
            },
            {
              count: 0,
              data: {},
              my: null,
            }
          );
          return {
            ...teacher,
            reactions: richByReactions,
          };
        });
        const sortedByReactions = richByReactions
          .sort((a, b) => b.reactions.count - a.reactions.count)
          .slice((page - 1) * limit, page * limit);

        const richByComments = sortedByReactions.map((teacher) => {
          const teacherComments = comments.filter(
            (comment) => comment.teachers.id === teacher.id
          );
          const richByComments = teacherComments.reduce(
            (
              acc: {
                count: number;
                my: boolean;
              },
              comment
            ) => {
              return {
                ...acc,
                count: acc.count + 1,
                my: student
                  ? comment.students.id === student.id
                    ? true
                    : false
                  : false,
              };
            },
            {
              count: 0,
              my: false,
            }
          );
          return {
            ...teacher,
            comments: richByComments,
          };
        });

        return richByComments;
      },
      {
        timeout: 50000,
      }
    );

    const richByDetails = await Promise.all(
      teachers.map(async (teacher) => {
        const details = await getTeacherDetail(teacher.name);

        return {
          ...teacher,
          details,
        };
      })
    );

    return richByDetails;
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
