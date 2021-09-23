import { Service } from 'typedi';
import MarkRepository from '../../gateways/mark/mark.repository';
import Mark from '../entities/mark.entity';
import { IUpdateMarksUseCase } from '../interfaces/update-marks.interface';

@Service()
export default class UpdateMarksUseCase implements IUpdateMarksUseCase {
  constructor(private _markRepository: MarkRepository) {}

  async updateMarks(
    card: string,
    prevMarks: Mark[],
    nextMarks: Mark[]
  ): Promise<Mark[]> {
    const updatedMarks =
      prevMarks.length > 0
        ? nextMarks.filter((nextMark) => {
            const found = prevMarks.some(
              (prevMark) =>
                nextMark.getTitle() === prevMark.getTitle() &&
                nextMark.getNum() === prevMark.getNum() &&
                nextMark.getSemester() === prevMark.getSemester() &&
                (nextMark.getValue() !== prevMark.getValue() ||
                  nextMark.getFactor() !== prevMark.getFactor())
            );

            return found;
          })
        : [];
    await this._markRepository.updateMarks(card, updatedMarks);

    return updatedMarks;
  }
}
