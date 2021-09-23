import UserInfoDto from '../../controllers/sign-in/dto/auth-info.dto';
import User from '../entities/user.entity';

export interface IGetUserUseCase {
  getUser(userInfoDto: UserInfoDto): Promise<User | undefined>;
}
