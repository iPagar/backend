import { OmitType } from "@nestjs/swagger";
import { StudentEntity } from "../../entities/student.entity";

export class GetStudentDto extends OmitType(StudentEntity, [
  "password",
] as const) {}
