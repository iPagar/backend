import CreateStudentDto from '../../../controllers/sign-in/dto/create-student.dto';

export default class GetMarksDto extends CreateStudentDto {
  semester: string;
}
