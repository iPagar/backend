import UserInfoDto from '../../controllers/sign-in/dto/auth-info.dto';

export interface IAuthUseCase {
  auth(query: string): UserInfoDto | undefined;
}
