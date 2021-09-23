import faker from 'faker/locale/ru';
import Student from '../student.entity';

describe('Student', () => {
  let student: Student;
  let card: string;
  let group: string;
  let initials: string;
  let surname: string;
  let password: string;

  beforeEach(() => {
    initials = `${faker.name.firstName().slice(0, 1)}. ${faker.name
      .middleName()
      .slice(0, 1)}.`;
    surname = faker.name.lastName();
    card = faker.datatype.number({ min: 100000, max: 999999 }).toString();
    group = faker.hacker.adjective();
    password = faker.internet.password();
    student = new Student(card, password, initials, surname, group);
  });

  it('should have initials, password, surname, card and group', () => {
    expect(student.getCard()).toBe(card);
    expect(student.getPassword()).toBe(password);
    expect(student.getInitials()).toBe(initials);
    expect(student.getSurname()).toBe(surname);
    expect(student.getGroup()).toBe(group);
  });
});
