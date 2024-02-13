require("reflect-metadata");
// load env
require("dotenv").config();
// express
import express from "express";
// cors and fs
import cors from "cors";
// securing
import helmet from "helmet";
import check from "vkui-sign-checker";
// loggers and error handlers
import createError from "http-errors";
import { expressLogger } from "./config/winston";
const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(
  express.urlencoded({ limit: "1mb", parameterLimit: 500, extended: true })
);
app.use(cors());
if (process.env.NODE_ENV === "production") {
  app.use(expressLogger);
}
app.disable("x-powered-by");

// check sign
app.use((req, res, next) => {
  // if request has api then next
  if (req.path.includes("/api")) return next();
  if (req.path.includes("/admin")) return next();

  const xSignHeader = req.headers[`x-sign-header`]?.slice(1);

  check(xSignHeader, process.env.VK_SECURE_MODULI)
    .then((params: any) => {
      req.body = { params, ...req.body };
      next();
    })
    .catch(() => {
      check(xSignHeader, process.env.VK_SECURE_SCHEDULE)
        .then((params: any) => {
          req.body = { params, ...req.body };
          next();
        })
        .catch(() => {
          try {
            if (typeof xSignHeader !== "string")
              throw new Error("Not a string");

            const { id, sign } = (xSignHeader as any)
              .split("&")
              .map((param: any) => param.split("="))
              .reduce(
                (acc: any, [key, value]: any) => ({ ...acc, [key]: value }),
                {}
              );

            if (sign === process.env.TEST_SIGN) {
              req.body = { params: { vk_user_id: id }, ...req.body };
              return next();
            }
          } catch (e) {}

          next(createError(401));
        });
    });
});

// modules
import manage from "./routes/manage";
import schedule from "./routes/schedule";
import teachers from "./routes/teachers";
import ol from "./routes/ol";

app.use([manage, schedule, teachers, ol]);

export { app };
