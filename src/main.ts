import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ExpressAdapter } from "@nestjs/platform-express";
import { app } from "..";
import { AllExceptionsFilter } from "../config/all-exception.filter";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { loadAdmin } from "./adminjs.loader";
import { PrismaClient } from "@prisma/client";

async function bootstrap() {
  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(app));
  nestApp.setGlobalPrefix("api");
  nestApp.enableCors();

  const { AdminJS, AdminJSExpress, getModelByName } = await loadAdmin();
  const prisma = new PrismaClient();

  const admin = new AdminJS({
    resources: [
      {
        resource: {
          model: getModelByName("VkUser"),
          client: prisma,
        },
        options: {},
      },
    ],
    branding: {
      companyName: "Stankin",
      withMadeWithLove: false,
      logo: false,
    },
  });
  if (process.env.NODE_ENV === "production") {
    const router = AdminJSExpress.buildAuthenticatedRouter(admin, {
      cookiePassword: process.env.JWT_SECRET!,
      authenticate: async (email, password) => {
        if (
          email === process.env.SUPER_ADMIN &&
          password === process.env.SYSTEM_ADMIN_PASSWORD
        ) {
          return {
            email: process.env.SUPER_ADMIN,
          };
        }
        return null;
      },
    });
    app.use(admin.options.rootPath, router);
  } else {
    const router = AdminJSExpress.buildRouter(admin);
    app.use(admin.options.rootPath, router);
  }

  const config = new DocumentBuilder()
    .setTitle("Stankin.Moduli API")
    .setDescription("The Stankin.Moduli API description")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "apiKey",
        in: "header",
        name: "x-sign-header",
      },
      "Authorization"
    )
    .addBearerAuth(
      {
        type: "apiKey",
        in: "header",
        name: "authorization",
      },
      "Authorization-Admin"
    )
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
