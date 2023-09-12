import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ExpressAdapter } from "@nestjs/platform-express";
import { app } from "..";
import { AllExceptionsFilter } from "../config/all-exception.filter";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Express } from "express-serve-static-core";

async function bootstrap() {
  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(app));
  nestApp.setGlobalPrefix("api");

  const config = new DocumentBuilder()
    .setTitle("Stankin.Moduli API")
    .setDescription("The Stankin.Moduli API description")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(nestApp, config);
  SwaggerModule.setup("api/docs", nestApp, document);

  // error handlers
  const httpAdapter = nestApp.get(HttpAdapterHost);
  nestApp.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  nestApp.useGlobalPipes(new ValidationPipe({ transform: true }));

  await nestApp.listen(process.env.PORT || 3000);
}
bootstrap();
