import { Action } from 'routing-controllers';
import { CurrentUserChecker } from 'routing-controllers/types/CurrentUserChecker';
import UserInfoDto from '../controllers/sign-in/dto/auth-info.dto';
import AuthUseCase from '../domain/use-cases/auth.use-case';

const currentUserChecker: CurrentUserChecker = async (
  action: Action
): Promise<UserInfoDto | undefined> => {
  const query = action.request?.headers['x-sign-header'];
  if (query) return new AuthUseCase().auth(query);
  return undefined;
};

export default currentUserChecker;
