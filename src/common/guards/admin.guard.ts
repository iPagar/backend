import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";

const authKey = process.env.TEST_SIGN;

@Injectable()
export class AdminGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const auth = request.headers.authorization;

    if (auth !== authKey) {
      return false;
    }

    return true;
  }
}
