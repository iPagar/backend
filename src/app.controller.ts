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

    return semesters
      .map((semester) => semester.semester)
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

  @Post("mongo-backup")
  @UseAdmin()
  async mongoBackup() {
    await this.backupService.createBackup();
  }
}
