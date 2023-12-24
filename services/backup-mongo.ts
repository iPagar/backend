import { BadRequestException, Injectable } from "@nestjs/common";
import * as AWS from "aws-sdk";
import * as fs from "fs";
import * as path from "path";
import { spawn } from "child_process";

let isBackupInProgress = false;
let isPgBackupInProgress = false;

@Injectable()
export class BackupService {
  private s3: AWS.S3;

  constructor() {
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    this.s3 = new AWS.S3();
  }

  async createBackup() {
    if (isBackupInProgress) {
      throw new BadRequestException("Backup is already in progress");
    }

    console.log("Начало резервного копирования MongoDB");
    isBackupInProgress = true;
    const pathBackup = path.join(process.cwd(), "backup");

    // Создание папки для резервных копий, если она еще не существует
    if (!fs.existsSync(pathBackup)) {
      fs.mkdirSync(pathBackup);
    }

    try {
      const args = [
        "--archive=" + path.join(pathBackup, "mongoBackup.archive"),
        "--gzip",
        "--uri=" + process.env.MONGO_URL,
      ];
      const mongodump = spawn("mongodump", args);
      mongodump.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
      });
      mongodump.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);

        isBackupInProgress = false;
      });

      mongodump.on("close", async (code) => {
        if (code === 0) {
          await this.uploadToS3(
            `${pathBackup}/mongoBackup.archive`,
            process.env.AWS_BUCKET_NAME!,
            "mongoBackup.archive"
          );
          // remove file
          fs.unlinkSync(`${pathBackup}/mongoBackup.archive`);

          console.log("Резервное копирование успешно выполнено");
        } else {
          console.error(`Backup error`);
        }

        isBackupInProgress = false;
      });
    } catch (error) {
      isBackupInProgress = false;
      console.error("Ошибка во время резервного копирования:", error);
    }
  }

  async createPgBackup() {
    if (isPgBackupInProgress) {
      throw new BadRequestException("Backup is already in progress");
    }

    console.log("Начало резервного копирования PostgreSQL");
    isPgBackupInProgress = true;
    const pathBackup = path.join(process.cwd(), "backup");

    // Создание папки для резервных копий, если она еще не существует
    if (!fs.existsSync(pathBackup)) {
      fs.mkdirSync(pathBackup);
    }

    try {
      const backupFileName = "postgresBackup.tar.gz";
      const backupPath = path.join(pathBackup, backupFileName);

      // Команда для создания резервной копии PostgreSQL
      const args = [
        "-Fc", // Формат файла
        "-Z",
        "9", // Максимальное сжатие gzip
        "-f",
        backupPath, // Путь и имя файла резервной копии
        process.env.DB_URL!, // URL подключения к базе данных
      ];

      const pgDump = spawn("pg_dump", args);

      pgDump.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
      });

      pgDump.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
        isBackupInProgress = false;
      });

      pgDump.on("close", async (code) => {
        if (code === 0) {
          await this.uploadToS3(
            backupPath,
            process.env.AWS_BUCKET_NAME!,
            backupFileName
          );
          // remove file
          fs.unlinkSync(backupPath);

          console.log("Резервное копирование успешно выполнено");
        } else {
          console.error(`Backup error`);
        }

        isPgBackupInProgress = false;
      });
    } catch (error) {
      isPgBackupInProgress = false;
      console.error("Ошибка во время резервного копирования:", error);
    }
  }

  private async uploadToS3(
    filePath: string,
    bucketName: string,
    s3Key: string
  ) {
    const fileContent = fs.readFileSync(filePath);
    const params = {
      Bucket: bucketName,
      Key: s3Key,
      Body: fileContent,
    };

    await this.s3.upload(params).promise();
  }
}
