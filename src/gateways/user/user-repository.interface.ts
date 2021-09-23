import UserInfoDto from '../../controllers/sign-in/dto/auth-info.dto';
import Student from '../../domain/entities/student.entity';
import User from '../../domain/entities/user.entity';

export interface IUserRepository {
  getUserById(userInfoDto: UserInfoDto): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(userInfoDto: UserInfoDto, student: Student): Promise<Student>;
  updateUser(userInfoDto: UserInfoDto, student: Student): Promise<Student>;
}
