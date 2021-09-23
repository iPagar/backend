import {
  CurrentUser,
  Get,
  JsonController,
  Param,
  QueryParams,
} from 'routing-controllers';
import { Service } from 'typedi';
import Mark from '../../domain/entities/mark.entity';
import GetMarksUseCase from '../../domain/use-cases/get-marks.use-case';
import GetStudentUseCase from '../../domain/use-cases/get-student.use-case';
import UserInfoDto from '../sign-in/dto/auth-info.dto';
import GetMarksFiltersDto from './dto/get-marks-filters.dto';
import PartialMark from './dto/get-marks.dto';

@JsonController('/students')
@Service()
export default class StudentsController {
  constructor(
    private _getStudentUseCase: GetStudentUseCase,
    private _getMarksUseCase: GetMarksUseCase
  ) {}

  @Get('/:card')
  async getStudent(
    @CurrentUser({ required: true }) userInfoDto: UserInfoDto,
    @Param('card') card: string
  ): Promise<{
    card: string;
    initials: string;
    surname: string;
    group: string;
  }> {
    const student = await this._getStudentUseCase.getStudent(userInfoDto, card);
    return {
      card: student.getCard(),
      initials: student.getInitials(),
      surname: student.getSurname(),
      group: student.getGroup(),
    };
  }

  @Get('/:card/marks')
  async getMarks(
    @CurrentUser({ required: true }) userInfoDto: UserInfoDto,
    @Param('card') card: string,
    @QueryParams() getMarksFiltersDto: GetMarksFiltersDto
  ): Promise<PartialMark[]> {
    const marks = await this._getMarksUseCase.getMarks(
      userInfoDto,
      card,
      getMarksFiltersDto
    );

    return marks.map(
      (mark) =>
        new PartialMark(
          mark.getTitle(),
          mark.getFactor(),
          mark.getNum(),
          mark.getValue(),
          mark.getSemester()
        )
    );
  }
}
