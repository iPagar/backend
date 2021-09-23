import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import GetMarksFiltersDto from '../../controllers/students/dto/get-marks-filters.dto';
import Mark from '../../domain/entities/mark.entity';
import { StudentOrmEntity } from '../student/student.orm-entity';
import { MarkOrmEntity } from './mark.orm-entity';
import { IMarkRepository } from './mark-repository.interface';
import MarkMapper from './mark.mapper';

@Service()
export default class MarkRepository implements IMarkRepository {
  constructor(
    @InjectRepository(MarkOrmEntity)
    private _markOrmRepository: Repository<MarkOrmEntity>,
    private _markMapper: MarkMapper,
    @InjectRepository(StudentOrmEntity)
    private _studentOrmRepository: Repository<StudentOrmEntity>
  ) {}

  async getMarksBySemester(card: string, semester: string): Promise<Mark[]> {
    const studentOrm = await this._studentOrmRepository.findOne({
      where: { card, semester },
      relations: ['marks'],
    });
    if (studentOrm) {
      const marks = studentOrm.marks.map((markOrm) =>
        this._markMapper.mapMarkOrmToMark(markOrm, card)
      );

      return marks;
    }

    throw new Error();
  }

  async createMarks(card: string, marks: Mark[]): Promise<Mark[]> {
    const marksOrm = marks.map((mark) =>
      this._markMapper.mapMarkToMarkOrm(mark, card)
    );
    await this._markOrmRepository.insert(marksOrm);

    return marks;
  }

  async updateMarks(card: string, marks: Mark[]): Promise<Mark[]> {
    const marksOrm = marks.map((mark) =>
      this._markMapper.mapMarkToMarkOrm(mark, mark.getCard())
    );
    await Promise.all(
      marksOrm.map((mark) => {
        const { subject, module, semester } = mark;
        return this._markOrmRepository.update(
          { subject, module, semester, card },
          mark
        );
      })
    );

    return marks;
  }

  async removeMarks(card: string, marks: Mark[]): Promise<Mark[]> {
    const marksOrm = marks.map((mark) =>
      this._markMapper.mapMarkToMarkOrm(mark, card)
    );
    await Promise.all(
      marksOrm.map(async (markOrm) => {
        const studentOrm = await this._studentOrmRepository.findOne({
          where: { card },
          relations: ['marks'],
        });
        if (studentOrm) {
          studentOrm.marks = studentOrm.marks.filter(
            (mark) =>
              mark.subject !== markOrm.subject &&
              mark.module !== markOrm.module &&
              mark.semester !== markOrm.semester
          );

          await this._markOrmRepository.remove(marksOrm);
        }
      })
    );

    return marks;
  }

  async getMarks(
    card: string,
    getMarksFiltersDto?: GetMarksFiltersDto
  ): Promise<Mark[]> {
    const subject = getMarksFiltersDto?.subject;
    const factor = Number(getMarksFiltersDto?.factor);
    const module = getMarksFiltersDto?.module;
    const semester = getMarksFiltersDto?.semester;
    const studentOrm = await this._studentOrmRepository.findOne({
      where: { card },
      relations: ['marks'],
    });
    if (studentOrm) {
      const marks = studentOrm.marks
        .map((markOrm) => this._markMapper.mapMarkOrmToMark(markOrm, card))
        .filter((mark) => (semester ? mark.getSemester() === semester : true));

      return marks;
    }

    throw new Error();
  }
}
