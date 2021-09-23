import faker from 'faker/locale/ru';
import CreateStudentDto from '../../../controllers/sign-in/dto/create-student.dto';
import StankinAdapter from '../../../gateways/lk/stankin.adapter';
import CreateStudentUseCase from '../create-student.use-case';
import UserInfoDto from '../../../controllers/sign-in/dto/auth-info.dto';
import UpdateMarksUseCase from '../update-marks.use-case';
import { UserRepository } from '../../../gateways/user/user.repository';
import { App } from '../../entities/user.entity';
import Student from '../../entities/student.entity';
import StankinStudent from '../../../gateways/lk/interfaces/stankin-student.interface';

jest.mock('../../../gateways/user/user.repository');
jest.mock('../../../gateways/lk/stankin.adapter');
jest.mock('../update-marks.use-case');

const UserRepositoryMock = <jest.Mock<UserRepository>>UserRepository;
const StankinAdapterMock = <jest.Mock<StankinAdapter>>StankinAdapter;
const UpdateMarkUseCaseMock = <jest.Mock<UpdateMarksUseCase>>UpdateMarksUseCase;

describe('CreateStudentUseCase', () => {
  let userInfoDto: UserInfoDto;
  let createStudentUseCase: CreateStudentUseCase;
  let createStudentDto: CreateStudentDto;
  let stankinStudent: StankinStudent;

  beforeEach(() => {
    const student = faker.datatype
      .number({ min: 100000, max: 999999 })
      .toString();
    const password = faker.internet.password();
    createStudentDto = { student, password };
    userInfoDto = { id: '2131', app: App.VK };
    const stankinAdapterMock = new StankinAdapterMock();
    stankinStudent = {
      surname: 'Фамилия',
      initials: 'И.И.',
      stgroup: 'БББ-21-01',
    };
    jest
      .spyOn(stankinAdapterMock, 'getStudent')
      .mockResolvedValue(stankinStudent);
    createStudentUseCase = new CreateStudentUseCase(
      new UserRepositoryMock(),
      stankinAdapterMock,
      new UpdateMarkUseCaseMock()
    );
  });

  describe('createStudent', () => {
    it('should return boolean', async () => {
      const card = createStudentDto.student;
      const { password } = createStudentDto;
      const student = new Student(
        card,
        password,
        stankinStudent.initials,
        stankinStudent.surname,
        stankinStudent.stgroup
      );
      jest.spyOn(createStudentUseCase, 'createStudent');
      await expect(
        createStudentUseCase.createStudent(userInfoDto, createStudentDto)
      ).resolves.toEqual(student);
    });
  });
});
