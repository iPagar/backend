import Markup from 'node-vk-bot-api/lib/markup';
import VkBot from 'node-vk-bot-api';
import { Service } from 'typedi';
import VkBotMessage from './dto/vk-bot-message.dto';
import Mark from '../../domain/entities/mark.entity';
import { isCurrentSemester } from '../../utils/current-semester';

@Service()
export default class VkBotAdapter {
  private vkBot: VkBot;

  private key = process.env.VK_BOT_KEY;

  constructor() {
    if (!this.key) throw new Error('VK_BOT_KEY should be defined');

    this.vkBot = new VkBot({
      token: this.key,
    });
  }

  async sendMessage(vkBotMessage: VkBotMessage): Promise<VkBotMessage> {
    const { userId, message, attachment, keyboard, sticker } = vkBotMessage;
    await this.vkBot.sendMessage(
      userId,
      message,
      attachment,
      keyboard,
      sticker
    );

    return vkBotMessage;
  }

  async sendMessageAboutMarksUpdates(
    userId: string,
    updatedMarks: Mark[]
  ): Promise<VkBotMessage> {
    const attachment = undefined;
    const keyboard = this.createKeyboardWithApp();
    const sticker = undefined;
    const sortedSemesters = [];

    for (const element of updatedMarks) {
      const existingGroups = sortedSemesters.filter(
        (group) => group.semester === element.getSemester()
      );
      if (existingGroups.length > 0) {
        const existingSubjects = existingGroups[0].subjects.filter(
          (subject) => subject.subject === element.getTitle()
        );
        if (existingSubjects.length > 0) {
          existingSubjects[0].marks[`${element.getNum()}`] = element.getValue();
        }
      } else {
        const newGroup = {
          subjects: [
            {
              marks: {
                [`${element.getNum()}`]: element.getValue(),
              },
              subject: element.getTitle(),
              factor: element.getFactor(),
            },
          ],
          semester: element.getSemester(),
        };
        sortedSemesters.push(newGroup);
      }
    }

    const message = sortedSemesters
      .reduce((messageWithSemesters: string, sortedSemester) => {
        if (
          sortedSemesters.length > 1 ||
          !isCurrentSemester(sortedSemester.semester)
        )
          messageWithSemesters += `${sortedSemester.semester}\n\n`;

        messageWithSemesters += sortedSemester.subjects.reduce(
          (message, sortedMark) => {
            message += `${sortedMark.subject}\n`;
            const { length } = Object.keys(sortedMark.marks);
            Object.keys(sortedMark.marks)
              .sort()
              .forEach((module, i) => {
                if (length > 1 && i < length - 1)
                  message += `${module}: ${sortedMark.marks[module]}, `;
                else message += `${module}: ${sortedMark.marks[module]}\n\n`;
              });

            return message;
          },
          ''
        );
        return messageWithSemesters;
      }, '')
      .trim();
    await this.sendMessage({ userId, message, attachment, keyboard, sticker });

    return { userId, message, attachment, keyboard, sticker };
  }

  createKeyboardWithApp(): VkBotKeyboard {
    const keyboard = Markup.keyboard(
      [
        Markup.button({
          action: {
            type: 'open_app',
            app_id: 7010368,
            label: 'Смотреть оценки',
            payload: JSON.stringify({
              url: 'https://vk.com/stankin.moduli#marks',
            }),
            hash: 'marks',
          },
        }),
      ],
      {
        columns: 1,
      }
    ).inline();

    return keyboard;
  }
}
