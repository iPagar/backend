import {
  Body,
  CurrentUser,
  Get,
  JsonController,
  Post,
} from 'routing-controllers';
import { Service } from 'typedi';
import CreateStudentUseCase from '../../domain/use-cases/create-student.use-case';
import CreateStudentDto from './dto/create-student.dto';
import UserInfoDto from './dto/auth-info.dto';
import GetUserUseCase from '../../domain/use-cases/get-user.use-case';
import Student from '../../domain/entities/student.entity';
import User from '../../domain/entities/user.entity';

@JsonController('/sign-in')
@Service()
export default class SignInController {
  constructor(
    private _createStudentUseCase: CreateStudentUseCase,
    private _getUserUseCase: GetUserUseCase
  ) {}

  @Post()
  createStudent(
    @CurrentUser({ required: true }) userInfoDto: UserInfoDto,
    @Body() createStudentDto: CreateStudentDto
  ): Promise<Student> {
    return this._createStudentUseCase.createStudent(
      userInfoDto,
      createStudentDto
    );
  }

  @Get()
  getUser(
    @CurrentUser({ required: true }) userInfoDto: UserInfoDto
  ): Promise<User | undefined> {
    return this._getUserUseCase.getUser(userInfoDto);
  }
}
