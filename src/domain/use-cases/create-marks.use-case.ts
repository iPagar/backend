import { Service } from 'typedi';
import MarkRepository from '../../gateways/mark/mark.repository';
import Mark from '../entities/mark.entity';
import { ICreateMarksUseCase } from '../interfaces/create-marks.interface';

@Service()
export default class CreateMarksUseCase implements ICreateMarksUseCase {
  constructor(private _markRepository: MarkRepository) {}

  async createMarks(
    card: string,
    prevMarks: Mark[],
    nextMarks: Mark[]
  ): Promise<Mark[]> {
    const createdMarks =
      prevMarks.length > 0
        ? nextMarks.filter((nextMark) => {
            const found = prevMarks.some(
              (prevMark) =>
                nextMark.getTitle() === prevMark.getTitle() &&
                nextMark.getNum() === prevMark.getNum() &&
                nextMark.getSemester() === prevMark.getSemester()
            );

            return !found;
          })
        : nextMarks;
    if (createdMarks.length > 0)
      await this._markRepository.createMarks(card, createdMarks);

    return createdMarks;
  }
}
