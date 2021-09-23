import Student from '../../domain/entities/student.entity';

export interface IStudentRepository {
  getStudentByCard(card: string): Promise<Student>;
  getSemestersByCard(card: string): Promise<string[]>;
}
