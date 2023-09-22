import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "./prisma.service";

@Controller("app")
@ApiTags("App")
export class AppController {
  constructor(private prismaService: PrismaService) {}

  @Get("semesters")
  @ApiOkResponse({
    description: "Semesters retrieved successfully",
    type: [String],
  })
  async getSemesters() {
    const semesters = await this.prismaService.semesters.findMany();

    return semesters.map((semester) => semester.semester);
  }
}
