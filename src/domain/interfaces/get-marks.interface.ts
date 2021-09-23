import UserInfoDto from '../../controllers/sign-in/dto/auth-info.dto';
import GetMarksFiltersDto from '../../controllers/students/dto/get-marks-filters.dto';
import Mark from '../entities/mark.entity';

export default interface IGetMarksUseCase {
  getMarks(
    userInfoDto: UserInfoDto,
    card: string,
    getMarksFiltersDto: GetMarksFiltersDto
  ): Promise<Mark[]>;
}
