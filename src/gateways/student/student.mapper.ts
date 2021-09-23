import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import Student from '../../domain/entities/student.entity';
import UserMapper from '../user/user.mapper';
import { StudentOrmEntity } from './student.orm-entity';

@Service()
export default class StudentMapper {
  constructor(
    @InjectRepository(StudentOrmEntity)
    private _studentOrmRepository: Repository<StudentOrmEntity>,
    private _userMapper: UserMapper
  ) {}

  mapStudentToStudentOrm(student: Student): StudentOrmEntity {
    const studentOrm = this._studentOrmRepository.create();
    studentOrm.card = student.getCard();
    studentOrm.password = student.getPassword();
    studentOrm.group = student.getGroup();
    studentOrm.initials = student.getInitials();
    studentOrm.surname = student.getSurname();

    return studentOrm;
  }

  mapStudentOrmToStudent(studentOrm: StudentOrmEntity): Student {
    const { card, group, initials, password, surname } = studentOrm;
    const users = studentOrm.users?.map((userOrm) =>
      this._userMapper.mapVkUserOrmToVkUser(userOrm)
    );
    const student = new Student(card, password, initials, surname, group);
    student.setUsers(users);

    return student;
  }
}
