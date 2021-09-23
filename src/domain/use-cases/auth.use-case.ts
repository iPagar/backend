import { createHmac } from 'crypto';
import { parse, ParsedUrlQuery, stringify } from 'querystring';
import UserInfoDto from '../../controllers/sign-in/dto/auth-info.dto';
import { App } from '../entities/user.entity';
import { IAuthUseCase } from '../interfaces/auth.interface';

export default class AuthUseCase implements IAuthUseCase {
  auth(header: string): UserInfoDto | undefined {
    const app = header.split(',')[0];

    if (app in App) {
      if (app === App.VK) {
        const query = header.split(',')[1];
        const isVkValid = AuthUseCase.isValid(
          query,
          process.env.VK_SECURE_MODULI
        );
        if (isVkValid) {
          const id = AuthUseCase.parse(query)?.vk_user_id;
          if (typeof id === 'string') return { app: App.VK, id };
        }
      }
    }
  }

  static parse(query: string): ParsedUrlQuery {
    const urlParams = parse(query);
    const ordered: ParsedUrlQuery = {};
    Object.keys(urlParams)
      .sort()
      .forEach((key) => {
        if (key.slice(0, 3) === 'vk_') {
          ordered[key] = urlParams[key];
        }
      });
    return ordered;
  }

  static isValid(query: string, secretKey: string | undefined): boolean {
    if (!secretKey) return false;

    const urlParams = parse(query);
    const parsedUrlQuery = this.parse(query);
    const stringParams = stringify(parsedUrlQuery);
    const paramsHash = createHmac('sha256', secretKey)
      .update(stringParams)
      .digest()
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=$/, '');

    return paramsHash === urlParams.sign;
  }
}
