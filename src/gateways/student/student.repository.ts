import { Inject, Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import Student from '../../domain/entities/student.entity';
import { IStudentRepository } from './student-repository.interface';
import { StudentOrmEntity } from './student.orm-entity';
import StudentMapper from './student.mapper';

@Service()
export default class StudentRepository implements IStudentRepository {
  constructor(
    @InjectRepository(StudentOrmEntity)
    private _studentOrmRepository: Repository<StudentOrmEntity>,
    @Inject() private _studentMapper: StudentMapper
  ) {}

  async getSemestersByCard(card: string): Promise<string[]> {
    const studentOrm = await this._studentOrmRepository.findOne({
      where: { card },
      relations: ['marks'],
    });

    if (studentOrm) {
      const semesters = Array.from(
        new Set(studentOrm.marks.map((mark) => mark.semester))
      );

      return semesters;
    }
    throw new Error();
  }

  async getStudents(): Promise<Student[]> {
    const studentsOrm = await this._studentOrmRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.users', 'user')
      .getMany();
    const students = studentsOrm.map((studentOrm) =>
      this._studentMapper.mapStudentOrmToStudent(studentOrm)
    );

    return students;
  }

  async getStudentByCard(card: string): Promise<Student> {
    const studentOrm = await this._studentOrmRepository.findOne({ card });

    if (studentOrm) {
      const { password, initials, surname, group } = studentOrm;
      const student = new Student(card, password, initials, surname, group);

      return student;
    }

    throw new Error();
  }
}
