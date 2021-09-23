import { Service } from 'typedi';
import UserInfoDto from '../../controllers/sign-in/dto/auth-info.dto';
import { UserRepository } from '../../gateways/user/user.repository';
import User from '../entities/user.entity';
import { IGetUserUseCase } from '../interfaces/get-user.interface';

@Service()
export default class GetUserUseCase implements IGetUserUseCase {
  constructor(private _userRepository: UserRepository) {}

  async getUser(userInfoDto: UserInfoDto): Promise<User | undefined> {
    return this._userRepository.getUserById(userInfoDto);
  }
}
