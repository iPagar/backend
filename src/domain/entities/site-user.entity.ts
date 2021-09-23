import User, { App } from './user.entity';

export default class SiteUser extends User {
  private _password: string;

  public get password(): string {
    return this._password;
  }

  public set password(value: string) {
    this._password = value;
  }

  constructor() {
    super();

    this.setApp(App.Site);
  }
}
