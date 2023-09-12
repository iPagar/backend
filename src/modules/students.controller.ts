import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { StudentEntity } from "../entities/student.entity";
import { Repository } from "typeorm";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { GetStudentDto } from "./dto/get-student.dto";
import { VkUserGuard, VkUser } from "../common/guards/vk-user.guard";
import { VkUserParam } from "../common/decorators/vk-user.decorator";

@Controller("students")
@ApiTags("Students")
export class StudentsController {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>
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
}
