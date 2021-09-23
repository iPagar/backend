import { Cron, CronController } from 'cron-decorators';
import { Service } from 'typedi';
import CreateStudentDto from '../../controllers/sign-in/dto/create-student.dto';
import StankinAdapter from '../../gateways/lk/stankin.adapter';
import MarkRepository from '../../gateways/mark/mark.repository';
import StudentRepository from '../../gateways/student/student.repository';
import VkBotAdapter from '../../gateways/vk-bot/vk-bot.adapter';
import INotifyUserUseCase from '../interfaces/notify-user.interface';
import CreateMarksUseCase from './create-marks.use-case';
import RemoveMarksUseCase from './remove-marks.use-case';
import UpdateMarksUseCase from './update-marks.use-case';

@Service()
@CronController('NotifyUser')
export default class NotifyUserUseCase implements INotifyUserUseCase {
  constructor(
    private _studentRepository: StudentRepository,
    private _updateMarksUseCase: UpdateMarksUseCase,
    private _createMarksUseCase: CreateMarksUseCase,
    private _removeMarksUseCase: RemoveMarksUseCase,
    private _stankinAdapter: StankinAdapter,
    private _markRepository: MarkRepository,
    private _vkBotAdapter: VkBotAdapter
  ) {}

  @Cron('notifyMarksChanges', '*/5 * * * * *')
  async notifyMarksChanges(): Promise<void> {
    const students = await this._studentRepository.getStudents();

    const userChanges = await Promise.all(
      students.map(async (student) => {
        const card = student.getCard();
        const password = student.getPassword();
        const createStudentDto = new CreateStudentDto();
        createStudentDto.student = card;
        createStudentDto.password = password;
        const prevMarks = await this._markRepository.getMarks(card);
        const nextMarks = await this._stankinAdapter.getMarks(createStudentDto);
        const createdMarks = await this._createMarksUseCase.createMarks(
          card,
          prevMarks,
          nextMarks
        );
        const updatedMarks = await this._updateMarksUseCase.updateMarks(
          card,
          prevMarks,
          nextMarks
        );
        const removedMarks = await this._removeMarksUseCase.removeMarks(
          card,
          prevMarks,
          nextMarks
        );

        return {
          student,
          createdMarks,
          updatedMarks,
          removedMarks,
        };
      })
    );

    const vkUsers = userChanges.filter(
      (userChange) =>
        userChange.student.getUsers().length &&
        userChange.updatedMarks.length > 0
    );
    vkUsers.forEach(async (vkUser) => {
      vkUser.student
        .getUsers()
        .forEach(async (user) =>
          this._vkBotAdapter.sendMessageAboutMarksUpdates(
            user.getId(),
            vkUser.updatedMarks
          )
        );
    });
  }
}
