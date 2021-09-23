import Mark from '../entities/mark.entity';

export interface ICreateMarksUseCase {
  createMarks(
    card: string,
    prevMarks: Mark[],
    nextMarks: Mark[]
  ): Promise<Mark[]>;
}
