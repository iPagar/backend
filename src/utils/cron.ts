import { registerController, startCron, useContainer } from 'cron-decorators';
import { Container } from 'typeorm-typedi-extensions';
import NotifyUserUseCase from '../domain/use-cases/notify-user.use-case';

useContainer(Container);

export default class CronJobs {
  static start(): void {
    registerController([NotifyUserUseCase]);
    startCron('notifyMarksChanges');
  }
}
