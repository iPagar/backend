import { Injectable, CanActivate } from "@nestjs/common";

@Injectable()
export class DisabledGuard implements CanActivate {
  constructor() {}

  async canActivate(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
