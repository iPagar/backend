import { Injectable } from "@nestjs/common";
import ms from "./manager-schedule";
import { logger } from "../config/winston";
import { mongo } from "../dbs/config";
import * as AWS from "aws-sdk";
import * as fs from "fs";
import { format } from "date-fns";

@Injectable()
export class ScheduleService {
  private s3: AWS.S3;

  constructor() {
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    this.s3 = new AWS.S3();
  }

  private async uploadToS3(
    filePath: string,
    s3Key: string
  ): Promise<{ publicUrl: string }> {
    const bucketName = process.env.AWS_BUCKET_NAME!;
    const fileContent = fs.readFileSync(filePath);
    const params: AWS.S3.PutObjectRequest = {
      Bucket: bucketName,
      Key: s3Key,
      Body: fileContent,
      ACL: "public-read",
    };

    const uploaded = await this.s3.upload(params).promise();

    return { publicUrl: uploaded.Location };
  }

  async updateSchedule(args: {
    steps: {
      courseExp: string;
      folderExp: string;
    }[];
    season: "spring" | "autumn";
    year: number;
  }) {
    try {
      // TODO: перед обновой раписания на проде - нужно все дропнуть
      // (потому что там нет проперти, которые появились сейчас)
      logger.info("Start updating schedule");
      for (const step of args.steps) {
        const downloadedFiles = await ms.downloadFromMoodle(
          new RegExp(step.courseExp),
          new RegExp(step.folderExp)
        );

        const result = await ms.update({
          files: downloadedFiles,
          season: args.season,
          year: args.year,
        });

        const hashes = Object.values(result).map((x) => x.pdf.hash);
        const filesCollection = (await mongo).collection("files");
        const files = await filesCollection
          .find({
            hash: { $in: hashes },
          })
          .toArray();

        // remove files from result that are already in db
        const newStgroups = Object.values(result).filter(
          (x) => !files.some((y) => y.hash === x.pdf.hash)
        );

        for (const stgroup of newStgroups) {
          // remove previous pdf
          const deleted = await filesCollection.deleteOne({
            stgroup: stgroup.pdf.stgroup,
            year: args.year,
            season: args.season,
          });
          if (deleted.deletedCount) {
            logger.info(`Deleted previous pdf`, {
              stgroup: stgroup.pdf.stgroup,
              year: args.year,
              season: args.season,
            });
          }
          // upload to s3
          const todayDate = format(new Date(), "yyyy-MM-dd");
          const s3Key =
            `schedules/${args.year}/${args.season}/${step.courseExp}/${stgroup.pdf.stgroup}` +
            `/${stgroup.pdf.stgroup}_${todayDate}.pdf`;
          const filepath = `./schedules/${stgroup.pdf.name}`;
          const uploaded = await this.uploadToS3(filepath, s3Key);
          // insert new pdf
          const updatedPdf = {
            ...stgroup.pdf,
            createdAt: new Date(),
            year: args.year,
            season: args.season,
            publicUrl: uploaded.publicUrl,
          };
          const insertedFile = await filesCollection.insertOne(updatedPdf);

          // remove old lessons
          const lessonsCollection = (await mongo).collection("lessons");
          await lessonsCollection.deleteMany({
            stgroup: stgroup.pdf.stgroup,
            year: args.year,
            season: args.season,
          });
          // insert new lessons
          const updatedLessons = stgroup.lessons.map((x) => {
            return {
              ...x,
              fileId: insertedFile.insertedId,
              year: args.year,
              season: args.season,
            };
          });
          await ms.insertLessons(updatedLessons);
        }
      }
      logger.info("Updated schedule");
    } catch (err) {
      logger.error(`Error updating schedule: ${err}`);
    }
  }
}
