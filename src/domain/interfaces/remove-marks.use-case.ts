import Mark from '../entities/mark.entity';

export default interface IRemoveMarksUseCase {
  removeMarks(
    card: string,
    prevMarks: Mark[],
    nextMarks: Mark[]
  ): Promise<Mark[]>;
}
