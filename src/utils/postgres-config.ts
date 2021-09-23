import { createConnection, useContainer } from 'typeorm';
import { Container } from 'typeorm-typedi-extensions';
import { MarkOrmEntity } from '../gateways/mark/mark.orm-entity';
import { StudentOrmEntity } from '../gateways/student/student.orm-entity';
import { VkUserOrmEntity } from '../gateways/user/vk-user.orm-entity';
import CronJobs from './cron';

useContainer(Container);

export default class PostgresAdapter {
  static async init(): Promise<void> {
    await createConnection({
      type: 'postgres',
      host: process.env.PG_DB_HOST,
      port: Number(process.env.PG_DB_PORT),
      username: process.env.PG_DB_USERNAME,
      password: process.env.PG_DB_PASSWORD,
      database: process.env.PG_DB_DATABASE,
      entities: [StudentOrmEntity, VkUserOrmEntity, MarkOrmEntity],
      synchronize: true,
      logging: false,
    });
    CronJobs.start();
  }
}
