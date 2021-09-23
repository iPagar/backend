import UserInfoDto from '../../controllers/sign-in/dto/auth-info.dto';
import CreateStudentDto from '../../controllers/sign-in/dto/create-student.dto';
import Student from '../entities/student.entity';

export interface ICreateStudentUseCase {
  createStudent(
    userInfoDto: UserInfoDto,
    createStudentDto: CreateStudentDto
  ): Promise<Student>;
}
