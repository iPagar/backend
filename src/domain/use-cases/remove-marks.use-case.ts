import { Service } from 'typedi';
import MarkRepository from '../../gateways/mark/mark.repository';
import Mark from '../entities/mark.entity';
import IRemoveMarksUseCase from '../interfaces/remove-marks.use-case';

@Service()
export default class RemoveMarksUseCase implements IRemoveMarksUseCase {
  constructor(private _markRepository: MarkRepository) {}

  async removeMarks(
    card: string,
    prevMarks: Mark[],
    nextMarks: Mark[]
  ): Promise<Mark[]> {
    const removedMarks =
      prevMarks.length > 0
        ? prevMarks.filter((prevMark) => {
            const found = nextMarks.some(
              (nextMark) =>
                nextMark.getTitle() === prevMark.getTitle() &&
                nextMark.getNum() === prevMark.getNum() &&
                nextMark.getSemester() === prevMark.getSemester()
            );

            return !found;
          })
        : [];
    if (removedMarks.length > 0)
      await this._markRepository.removeMarks(card, removedMarks);

    return removedMarks;
  }
}
