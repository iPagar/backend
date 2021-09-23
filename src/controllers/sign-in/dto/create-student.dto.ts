import { Length } from 'class-validator';

export default class CreateStudentDto {
  @Length(1, 35)
  student: string;

  @Length(1, 35)
  password: string;
}
