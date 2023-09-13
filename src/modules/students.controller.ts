import {
  BadGatewayException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { StudentEntity } from "../entities/student.entity";
import { DataSource, Repository } from "typeorm";
import { ApiBody, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { GetStudentDto } from "./dto/get-student.dto";
import { VkUserGuard, VkUser } from "../common/guards/vk-user.guard";
import { VkUserParam } from "../common/decorators/vk-user.decorator";
import { LoginDto } from "./dto/login.dto";
import db from "../../services/queries";
import { SemesterEntity } from "../entities/semester.entity";
import { MarkEntity } from "../entities/mark.entity";
import { LkMark, getMarks, getSemesters, getStudent } from "../../services/lk";
import { Response } from "express";
import { RatingEntity } from "../entities/rating.entity";
import { DisabledGuard } from "../common/guards/disabled.guard";

function getRating(
  subjects: {
    marks: {
      [x: string]: number;
    };
    subject: string;
    factor: number;
  }[]
) {
  const isAll =
    subjects.length > 0
      ? subjects.every((subject) =>
          Object.keys(subject.marks).every((module) => {
            const value = subject.marks[module];
            const factor = subject.factor;

            return value >= 25 && factor > 0;
          })
        )
      : false;

  if (isAll) {
    let sum = 0;
    let sumFactor = 0;

    subjects.forEach((subject) => {
      let sumFactorSubject = 0;
      let sumSubject = 0;

      const factor = subject.factor;

      Object.keys(subject.marks).forEach((module) => {
        const value = subject.marks[module];

        if (module === "М1") {
          sumFactorSubject += 3;
          sumSubject += value * 3;
        } else if (module === "М2") {
          sumFactorSubject += 2;
          sumSubject += value * 2;
        } else if (module === "З") {
          sumFactorSubject += 5;
          sumSubject += value * 5;
        } else if (module === "К") {
          sumFactorSubject += 5;
          sumSubject += value * 5;
        } else if (module === "Э") {
          sumFactorSubject += 7;
          sumSubject += value * 7;
        }
      });

      sumFactor += factor;
      sum += (sumSubject / sumFactorSubject) * factor;
    });

    const rating = sum / sumFactor;

    return rating;
  }

  return null;
}

function getFilteredMarks(marks: MarkEntity[]) {
  const groups = [];

  for (let element of marks) {
    let existingGroups = groups.filter(
      (group) => group.subject === element.subject
    );
    if (existingGroups.length > 0) {
      existingGroups[0].marks[`${element.module}`] = element.value;
    } else {
      let newGroup = {
        marks: {
          [`${element.module}`]: element.value,
        },
        subject: element.subject,
        factor: element.factor,
      };
      groups.push(newGroup);
    }
  }

  return groups;
}

@Controller("students")
@ApiTags("Students")
export class StudentsController {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    @InjectRepository(SemesterEntity)
    private readonly semesterRepository: Repository<SemesterEntity>,
    @InjectRepository(MarkEntity)
    private readonly markRepository: Repository<MarkEntity>,
    private dataSource: DataSource
  ) {}

  @Get("me")
  @ApiOkResponse({
    description: "Student retrieved successfully",
    type: GetStudentDto,
  })
  @UseGuards(VkUserGuard)
  async getMe(@VkUserParam() vkUser: VkUser) {
    const foundStudent = await this.studentRepository.findOne({
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
    return this.studentRepository.find();
  }

  @Get(":id")
  @ApiOkResponse({
    description: "Student retrieved successfully",
    type: GetStudentDto,
  })
  @UseGuards(DisabledGuard)
  getOne(@Param("id") id: number) {
    return this.studentRepository.findOne({
      where: {
        id,
      },
    });
  }

  @Post("login")
  @ApiBody({
    description: "Student's id and password",
    type: LoginDto,
  })
  @ApiOkResponse({ description: "Student logged in successfully" })
  @UseGuards(VkUserGuard)
  async login(@VkUserParam() vkUser: VkUser, @Body() loginDto: LoginDto) {
    await this.dataSource.transaction(async (manager) => {
      const lkStudent = await getStudent(
        Number(loginDto.studentId),
        loginDto.password
      );
      const { surname, initials, stgroup } = lkStudent;
      const createdStudent = this.studentRepository.create({
        id: Number(vkUser.vk_user_id),
        surname,
        initials,
        stgroup,
        student: Number(loginDto.studentId),
        password: loginDto.password,
      });

      await manager.save(createdStudent);

      const semesters = await getSemesters(
        Number(loginDto.studentId),
        loginDto.password
      );
      const semesterEntities = semesters.map((semester) => ({
        semester,
      }));

      const createdSemesters = this.semesterRepository.create(semesterEntities);

      await manager.save(createdSemesters);

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

      const markEntities = markGroups
        .flat()
        .map((markGroup) =>
          this.markRepository.create(
            markGroup.marks.map((mark) => ({
              subject: mark.title,
              value: mark.value,
              factor: mark.factor,
              module: mark.num,
              semester: markGroup.semester,
              student: createdStudent,
            }))
          )
        )
        .flat();

      await manager.save(markEntities);

      for (const makrGroup of markGroups) {
        const filteredMarks = getFilteredMarks(
          markEntities.filter((mark) => mark.semester === makrGroup.semester)
        );
        const rating = getRating(filteredMarks);

        if (rating) {
          const createdRating = new RatingEntity();
          createdRating.rating = rating;
          createdRating.semester = makrGroup.semester;
          createdRating.student = createdStudent;
          await manager.save(createdRating);
        } else {
          const ratingRepository = manager.getRepository(RatingEntity);
          await ratingRepository.delete({
            semester: makrGroup.semester,
            student: createdStudent,
          });
        }
      }
    });

    const foundStudent = await this.studentRepository.findOne({
      where: {
        id: Number(vkUser.vk_user_id),
      },
    });

    if (foundStudent) {
      return foundStudent;
    }

    throw new BadGatewayException();
  }

  @Post("logout")
  @ApiOkResponse({ description: "Student logged out successfully" })
  @UseGuards(VkUserGuard)
  async logout(@VkUserParam() vkUser: VkUser, @Res() res: Response) {
    await this.studentRepository.delete(vkUser.vk_user_id);

    res.status(200).send();
  }
}
