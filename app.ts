import 'reflect-metadata';
import { useContainer, useExpressServer } from 'routing-controllers';
import { ValidatorOptions } from 'class-validator';
import express from 'express';
import dotenv from 'dotenv';
import { Container } from 'typeorm-typedi-extensions';
import currentUserChecker from './src/utils/current-use-checker';
import { ErrorHandler } from './src/utils/error-handler';
import SignInController from './src/controllers/sign-in/sign-in.controller';
import StudentsController from './src/controllers/students/students.controller';
import PostgresAdapter from './src/utils/postgres-config';

dotenv.config();

await PostgresAdapter.init();

useContainer(Container);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const validation: ValidatorOptions = {
  validationError: { target: false },
};

useExpressServer(app, {
  currentUserChecker,
  validation,
  defaultErrorHandler: false,
  controllers: [SignInController, StudentsController],
  middlewares: [ErrorHandler],
});

app.listen(process.env.APP_PORT, () => {
  console.log(`App listening on port ${process.env.APP_PORT}`);
});
