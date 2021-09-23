import Mark from './mark.entity';
import User from './user.entity';

export default class Student {
  private surname: string;

  public getSurname(): string {
    return this.surname;
  }

  public setSurname(surname: string) {
    this.surname = surname;
  }

  private initials: string;

  public getInitials(): string {
    return this.initials;
  }

  public setInitials(initials: string) {
    this.initials = initials;
  }

  private card: string;

  public getCard(): string {
    return this.card;
  }

  public setCard(card: string) {
    this.card = card;
  }

  private password: string;

  public getPassword(): string {
    return this.password;
  }

  public setPassword(password: string) {
    this.password = password;
  }

  private group: string;

  public setGroup(group: string) {
    this.group = group;
  }

  public getGroup(): string {
    return this.group;
  }

  private users: User[];

  public setUsers(users: User[]) {
    this.users = users;
  }

  public getUsers() {
    return this.users;
  }

  constructor(
    card: string,
    password: string,
    initials: string,
    surname: string,
    group: string
  ) {
    this.card = card;
    this.password = password;
    this.initials = initials;
    this.surname = surname;
    this.group = group;
  }
}
