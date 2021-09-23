import getMarksFiltersDto from '../../controllers/students/dto/get-marks-filters.dto';
import Mark from '../../domain/entities/mark.entity';

export interface IMarkRepository {
  getMarks(card: string, getMarksFilters: getMarksFiltersDto): Promise<Mark[]>;
  getMarksBySemester(card: string, semester: string): Promise<Mark[]>;
  updateMarks(card: string, marks: Mark[]): Promise<Mark[]>;
  createMarks(card: string, marks: Mark[]): Promise<Mark[]>;
  removeMarks(card: string, marks: Mark[]): Promise<Mark[]>;
}
