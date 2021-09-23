import faker from 'faker/locale/ru';
import CreateStudentDto from '../../../controllers/sign-in/dto/create-student.dto';
import { Module } from '../../../domain/entities/mark.entity';
import GetMarksDto from '../dto/get-marks.dto';
import StankinMark from '../interfaces/stankin-mark.interface';
import StankinSemesters from '../interfaces/stankin-semesters.interface';
import StankinStudent from '../interfaces/stankin-student.interface';
import StankinAdapter from '../stankin.adapter';

describe('StankinAdapter', () => {
  let stankinAdapter: StankinAdapter;
  let getMarksDto: GetMarksDto;
  let stankinMarks: [...StankinMark[]];
  let stankinStudent: StankinStudent;
  let stankinSemesters: StankinSemesters;
  let createStudentDto: CreateStudentDto;

  beforeEach(() => {
    const student = faker.datatype
      .number({ min: 100000, max: 999999 })
      .toString();
    const password = faker.internet.password();
    const semester = faker.hacker.phrase();
    stankinSemesters = { semesters: [faker.hacker.noun(), semester] };
    const initials = `${faker.name.firstName().slice(0, 1)}. ${faker.name
      .middleName()
      .slice(0, 1)}.`;
    const surname = faker.name.lastName();
    const group = faker.datatype.string();
    stankinStudent = { surname, initials, stgroup: group };
    createStudentDto = { student, password };
    getMarksDto = { ...createStudentDto, semester };
    stankinMarks = [
      {
        title: faker.hacker.phrase(),
        value: faker.datatype.number({ min: 25, max: 54 }),
        factor: faker.datatype.number({ min: 25, max: 54 }),
        num: Module[
          Module[
            faker.datatype.number({
              min: 0,
              max: Object.keys(Module).length,
            })
          ] as keyof typeof Module
        ],
      },
    ];

    stankinAdapter = new StankinAdapter();
  });

  describe('getMarks', () => {
    it('should return marks', () => {
      jest.spyOn(stankinAdapter, 'getMarks').mockResolvedValue(stankinMarks);

      expect(stankinAdapter.getMarksBySemester(getMarksDto)).resolves.toBe(
        stankinMarks
      );
    });
  });

  describe('getSemesters', () => {
    it('should return semesters', () => {
      jest
        .spyOn(stankinAdapter, 'getSemesters')
        .mockResolvedValue(stankinSemesters);

      expect(stankinAdapter.getSemesters(createStudentDto)).resolves.toBe(
        stankinSemesters
      );
    });
  });

  describe('getStudent', () => {
    it('should return student', () => {
      jest
        .spyOn(stankinAdapter, 'getStudent')
        .mockResolvedValue(stankinStudent);

      expect(stankinAdapter.getStudent(createStudentDto)).resolves.toBe(
        stankinStudent
      );
    });
  });
});
