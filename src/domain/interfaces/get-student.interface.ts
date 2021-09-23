import UserInfoDto from '../../controllers/sign-in/dto/auth-info.dto';
import GetStudentDto from '../../controllers/students/dto/get-student.dto';
import Student from '../entities/student.entity';

export interface IGetStudentUseCase {
  getStudent(
    userInfoDto: UserInfoDto,
    card: string
  ): Promise<Student | undefined>;
}
