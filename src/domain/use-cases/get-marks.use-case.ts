import { Service } from 'typedi';
import UserInfoDto from '../../controllers/sign-in/dto/auth-info.dto';
import GetMarksFiltersDto from '../../controllers/students/dto/get-marks-filters.dto';
import MarkRepository from '../../gateways/mark/mark.repository';
import { UserRepository } from '../../gateways/user/user.repository';
import Mark from '../entities/mark.entity';
import IGetMarksUseCase from '../interfaces/get-marks.interface';

@Service()
export default class GetMarksUseCase implements IGetMarksUseCase {
  constructor(
    private _markRepository: MarkRepository,
    private _userRepository: UserRepository
  ) {}

  async getMarks(
    userInfoDto: UserInfoDto,
    card: string,
    getMarksFiltersDto: GetMarksFiltersDto
  ): Promise<Mark[]> {
    const user = await this._userRepository.getUserById(userInfoDto);

    if (user?.getCards().includes(card))
      return this._markRepository.getMarks(card, getMarksFiltersDto);

    throw new Error();
  }
}
