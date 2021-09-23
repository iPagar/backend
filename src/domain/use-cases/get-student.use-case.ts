import { Service } from 'typedi';
import UserInfoDto from '../../controllers/sign-in/dto/auth-info.dto';
import StudentRepository from '../../gateways/student/student.repository';
import Student from '../entities/student.entity';
import { IGetStudentUseCase } from '../interfaces/get-student.interface';
import GetUserUseCase from './get-user.use-case';

@Service()
export default class GetStudentUseCase implements IGetStudentUseCase {
  constructor(
    private _getUserUseCase: GetUserUseCase,
    private _studentRepository: StudentRepository
  ) {}

  async getStudent(userInfoDto: UserInfoDto, card: string): Promise<Student> {
    const user = await this._getUserUseCase.getUser(userInfoDto);
    if (user && user.getCards().includes(card)) {
      const student = await this._studentRepository.getStudentByCard(card);

      return student;
    }

    throw new Error();
  }
}
