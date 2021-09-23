import faker from 'faker/locale/ru';
import StankinAdapter from '../../../gateways/lk/stankin.adapter';
import MarkRepository from '../../../gateways/mark/mark.repository';
import StudentRepository from '../../../gateways/student/student.repository';
import Mark, { Module } from '../../entities/mark.entity';
import UpdateMarksUseCase from '../update-marks.use-case';

jest.mock('../../../gateways/user/user.repository');
jest.mock('../../../gateways/lk/stankin.adapter');
jest.mock('../../../gateways/mark/mark.repository');

const StudentRepositoryMock = <jest.Mock<StudentRepository>>StudentRepository;
const StankinAdapterMock = <jest.Mock<StankinAdapter>>StankinAdapter;
const MarkRepositoryMock = <jest.Mock<MarkRepository>>MarkRepository;

describe('UpdateMarksUseCase', () => {
  let updateMarksUseCase: UpdateMarksUseCase;

  beforeEach(() => {
    updateMarksUseCase = new UpdateMarksUseCase(
      new StudentRepositoryMock(),
      new MarkRepositoryMock(),
      new StankinAdapterMock()
    );
  });

  describe('updateMarks', () => {});

  describe('getDiffer', () => {
    it('should return created marks', async () => {
      const prevMarks: Mark[] = [
        new Mark('title1', 25, 3.0, Module.М2, '2020-осень'),
      ];
      const createdMarks = [
        new Mark('title', 45, 3.5, Module.М1, '2020-осень'),
        new Mark('title2', 30, 2.0, Module.Э, '2020-осень'),
      ];
      const nextMarks: Mark[] = [...createdMarks, ...prevMarks];

      await expect(
        updateMarksUseCase.getDiffer(prevMarks, nextMarks)
      ).resolves.toMatchObject({ created: [...createdMarks] });
    });

    it('should return updated marks', async () => {
      const prevMarks: Mark[] = [
        new Mark('title1', 40, 3.0, Module.М1, '2020-осень'),
        new Mark('title', 45, 3.5, Module.М1, '2020-осень'),
      ];
      const updatedMarks = [
        new Mark('title', 25, 3.5, Module.М1, '2020-осень'),
      ];
      const nextMarks: Mark[] = [...updatedMarks, ...prevMarks];
      await expect(
        updateMarksUseCase.getDiffer(prevMarks, nextMarks)
      ).resolves.toMatchObject({ updated: [...updatedMarks] });
    });

    it('should return removed marks', async () => {
      const prevMarks: Mark[] = [
        new Mark('title1', 40, 3.0, Module.М1, '2020-осень'),
        new Mark('title', 45, 3.5, Module.М1, '2020-осень'),
      ];
      const nextMarks: Mark[] = [
        new Mark('title', 45, 3.5, Module.М1, '2020-осень'),
      ];
      await expect(
        updateMarksUseCase.getDiffer(prevMarks, nextMarks)
      ).resolves.toMatchObject({
        removed: [new Mark('title1', 40, 3.0, Module.М1, '2020-осень')],
      });
    });

    it('should return created, updated and removed marks', async () => {
      const prevMarks: Mark[] = [
        new Mark('title2', 40, 3.0, Module.М1, '2020-осень'),
        new Mark('title1', 40, 3.0, Module.М1, '2020-осень'),
        new Mark('title', 45, 3.5, Module.М1, '2020-осень'),
      ];
      const nextMarks: Mark[] = [
        new Mark('title3', 40, 3.0, Module.М1, '2020-осень'),
        new Mark('title1', 20, 3.0, Module.М1, '2020-осень'),
        new Mark('title', 45, 3.5, Module.М1, '2020-осень'),
      ];
      await expect(
        updateMarksUseCase.getDiffer(prevMarks, nextMarks)
      ).resolves.toEqual({
        created: [new Mark('title3', 40, 3.0, Module.М1, '2020-осень')],
        updated: [new Mark('title1', 20, 3.0, Module.М1, '2020-осень')],
        removed: [new Mark('title2', 40, 3.0, Module.М1, '2020-осень')],
      });
    });
  });
});
