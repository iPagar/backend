import Mark from '../entities/mark.entity';

export interface IUpdateMarksUseCase {
  updateMarks(
    card: string,
    prevMarks: Mark[],
    nextMarks: Mark[]
  ): Promise<Mark[]>;
}
