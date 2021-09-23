import got, { Got, Options } from 'got';
import { Service } from 'typedi';
import https from 'https';
import CreateStudentDto from '../../controllers/sign-in/dto/create-student.dto';
import Mark from '../../domain/entities/mark.entity';
import GetMarksDto from './dto/get-marks.dto';
import StankinMark from './interfaces/stankin-mark.interface';
import StankinSemesters from './interfaces/stankin-semesters.interface';
import StankinStudent from './interfaces/stankin-student.interface';

@Service()
export default class StankinAdapter {
  private _options: Options = {
    prefixUrl: 'https://lk.stankin.ru/webapi/api2',
    responseType: 'json',
    headers: {
      'Content-type': 'application/x-www-form-urlencoded; charset=utf-8',
    },
    agent: { https: new https.Agent({ keepAlive: true }) },
  };

  private _stankin: Got;

  constructor(options: Options = {}) {
    this._stankin = got.extend(got.mergeOptions(this._options, options));
  }

  async getMarksBySemester(
    getMarksDto: GetMarksDto
  ): Promise<[...StankinMark[]]> {
    const marksRequest = await this._stankin.post<[...StankinMark[]]>('marks', {
      form: getMarksDto,
    });

    return marksRequest.body.filter(
      (mark) => mark.title !== 'Рейтинг' && mark.title !== 'Накопленный Рейтинг'
    );
  }

  async getMarks(createStudentDto: CreateStudentDto): Promise<Mark[]> {
    const { semesters } = await this.getSemesters(createStudentDto);
    const getMarksDto = new GetMarksDto();
    getMarksDto.student = createStudentDto.student;
    getMarksDto.password = createStudentDto.password;
    const semestersWithMarks = await Promise.all(
      semesters.map(async (semester) => {
        getMarksDto.semester = semester;
        const marks = await this.getMarksBySemester(getMarksDto);

        return { semester, marks };
      })
    );
    const nextMarks = semestersWithMarks.reduce(
      (acc: Mark[], semesterWithMarks) => {
        const { semester } = semesterWithMarks;
        const marks = semesterWithMarks.marks.map((stankinMark) => {
          const { title, value, factor, num } = stankinMark;
          const mark = new Mark(
            title,
            value,
            factor,
            num,
            semester,
            getMarksDto.student
          );

          return mark;
        });

        return acc.concat(marks);
      },
      []
    );

    return nextMarks;
  }

  async getSemesters(
    createStudentDto: CreateStudentDto
  ): Promise<StankinSemesters> {
    const semestersRequest = await this._stankin.post<StankinSemesters>(
      'semesters',
      {
        form: createStudentDto,
      }
    );

    return semestersRequest.body;
  }

  async getStudent(
    createStudentDto: CreateStudentDto
  ): Promise<StankinStudent> {
    const studentRequest = await this._stankin.post<StankinStudent>(
      'semesters',
      {
        form: createStudentDto,
      }
    );

    return studentRequest.body;
  }
}
