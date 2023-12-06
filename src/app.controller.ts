import { Controller, Get, Post } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "./prisma.service";
import { BackupService } from "../services/backup-mongo";
import { UseAdmin } from "./common/decorators/admin.decorator";

@Controller("app")
@ApiTags("App")
export class AppController {
  constructor(
    private prismaService: PrismaService,
    private backupService: BackupService
  ) {}

  @Get("semesters")
  @ApiOkResponse({
    description: "Semesters retrieved successfully",
    type: [String],
  })
  async getSemesters() {
    const semesters = await this.prismaService.semesters.findMany();

    return semesters.map((semester) => semester.semester);
  }

  @Post("mongo-backup")
  @UseAdmin()
  async mongoBackup() {
    await this.backupService.createBackup();
  }
}
