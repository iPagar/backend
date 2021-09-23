import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import authInfoDto from '../../controllers/sign-in/dto/auth-info.dto';
import Student from '../../domain/entities/student.entity';
import User from '../../domain/entities/user.entity';
import VkUser from '../../domain/entities/vk-user.entity';
import StudentMapper from '../student/student.mapper';
import { StudentOrmEntity } from '../student/student.orm-entity';
import StudentRepository from '../student/student.repository';
import { IUserRepository } from './user-repository.interface';
import UserMapper from './user.mapper';
import { VkUserOrmEntity } from './vk-user.orm-entity';

@Service()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(VkUserOrmEntity)
    private _vkUserOrmRepository: Repository<VkUserOrmEntity>,
    private _studentRepository: StudentRepository,
    private _studentMapper: StudentMapper,
    private _userMapper: UserMapper,
    @InjectRepository(StudentOrmEntity)
    private _studentOrmRepository: Repository<StudentOrmEntity>
  ) {}

  async getUsers(): Promise<User[]> {
    const vkUsersOrm = await this._vkUserOrmRepository.find({
      relations: ['students'],
    });
    const vkUsers = vkUsersOrm.map((vkUserOrm) =>
      this._userMapper.mapVkUserOrmToVkUser(vkUserOrm)
    );

    return vkUsers;
  }

  async getUserById(userInfoDto: authInfoDto): Promise<User | undefined> {
    const { id } = userInfoDto;

    const vkUser = await this._vkUserOrmRepository.findOne({
      where: { id },
      relations: ['students'],
    });

    if (vkUser) {
      const user = new VkUser(id);
      user.setCards(vkUser.students.map((student) => student.card));

      return user;
    }

    return undefined;
  }

  async updateUser(
    userInfoDto: authInfoDto,
    student: Student
  ): Promise<Student> {
    const { id } = userInfoDto;
    const vkUserOrm = await this._vkUserOrmRepository.findOne({
      where: { id },
      relations: ['students'],
    });
    if (vkUserOrm) {
      const studentOrm = this._studentMapper.mapStudentToStudentOrm(student);
      vkUserOrm.students = vkUserOrm.students.concat(studentOrm);

      await this._studentOrmRepository.save(studentOrm);
      await this._vkUserOrmRepository.save(vkUserOrm);
    }

    return student;
  }

  async createUser(
    userInfoDto: authInfoDto,
    student: Student
  ): Promise<Student> {
    const { id } = userInfoDto;
    const vkUserOrm = this._vkUserOrmRepository.create();
    const studentOrm = this._studentMapper.mapStudentToStudentOrm(student);
    vkUserOrm.students = [studentOrm];
    vkUserOrm.id = id;
    await this._studentOrmRepository.save(studentOrm);
    await this._vkUserOrmRepository.save(vkUserOrm);

    return student;
  }
}
