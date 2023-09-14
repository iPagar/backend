import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { MarkEntity } from "../../entities/mark.entity";
import { Repository } from "typeorm";
import { StudentGuard } from "../../common/guards/student.guard";
import { StudentParam } from "../../common/decorators/student.decorator";
import { StudentEntity } from "../../entities/student.entity";

@Controller("marks")
@ApiTags("Marks")
export class MarksController {
  constructor(
    @InjectRepository(MarkEntity)
    private readonly marksRepository: Repository<MarkEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>
  ) {}

  @Get("/notify")
  @UseGuards(StudentGuard)
  @ApiOkResponse({
    description: "Returns true if student has notifications enabled",
    type: Boolean,
  })
  notify(@StudentParam() student: StudentEntity) {
    return student.notify;
  }

  @Post("/notify")
  @UseGuards(StudentGuard)
  @ApiOkResponse({
    description: "Switch notifications for student",
    type: Boolean,
  })
  async switchNotify(@StudentParam() student: StudentEntity) {
    student.notify = !student.notify;
    await this.studentRepository.save(student);
    return student.notify;
  }

  @Get(":semester")
  @UseGuards(StudentGuard)
  @ApiOkResponse({
    description: "Returns marks for student for given semester",
    type: [MarkEntity],
  })
  async getSemesterMarks(
    @StudentParam() student: StudentEntity,
    @Param("semester") semester: string
  ) {
    return this.marksRepository.find({
      where: {
        student,
        semester,
      },
    });
  }
}