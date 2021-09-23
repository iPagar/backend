import { Service } from 'typedi';
import CreateStudentDto from '../../controllers/sign-in/dto/create-student.dto';
import Student from '../entities/student.entity';
import { ICreateStudentUseCase } from '../interfaces/create-student.interface';
import StankinAdapter from '../../gateways/lk/stankin.adapter';
import UserInfoDto from '../../controllers/sign-in/dto/auth-info.dto';
import { UserRepository } from '../../gateways/user/user.repository';
import CreateMarksUseCase from './create-marks.use-case';
import MarkRepository from '../../gateways/mark/mark.repository';

@Service()
export default class CreateStudentUseCase implements ICreateStudentUseCase {
  constructor(
    private _userRepository: UserRepository,
    private _stankinAdapter: StankinAdapter,
    private _createMarksUseCase: CreateMarksUseCase,
    private _markRepository: MarkRepository
  ) {}

  async createStudent(
    userInfoDto: UserInfoDto,
    createStudentDto: CreateStudentDto
  ): Promise<Student> {
    const { initials, surname, stgroup } =
      await this._stankinAdapter.getStudent(createStudentDto);
    const card = createStudentDto.student;
    const { password } = createStudentDto;
    const student = new Student(card, password, initials, surname, stgroup);

    const isUserSaved = await this._userRepository.getUserById(userInfoDto);

    if (isUserSaved)
      await this._userRepository.updateUser(userInfoDto, student);
    else await this._userRepository.createUser(userInfoDto, student);
    const nextMarks = await this._stankinAdapter.getMarks(createStudentDto);
    const prevMarks = await this._markRepository.getMarks(card);
    await this._createMarksUseCase.createMarks(card, prevMarks, nextMarks);

    return student;
  }
}
