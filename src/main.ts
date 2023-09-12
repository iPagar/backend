import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ExpressAdapter } from "@nestjs/platform-express";
import { app } from "..";
import { AllExceptionsFilter } from "../config/all-exception.filter";

async function bootstrap() {
  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(app));

  // error handlers
  const httpAdapter = nestApp.get(HttpAdapterHost);
  nestApp.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  await nestApp.listen(process.env.PORT || 3000);
}
bootstrap();
