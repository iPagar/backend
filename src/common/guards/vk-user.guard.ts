import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import qs from "querystring";
import crypto from "crypto";
import { z } from "zod";

@Injectable()
export class VkUserGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const vkUser = extractVkUserFromHeader(request);

    if (!vkUser) {
      throw new UnauthorizedException();
    }

    request["vkUser"] = vkUser;

    return true;
  }
}

export function extractVkUserFromHeader(request: Request): VkUser | null {
  const xSignHeader = request.headers[`x-sign-header`]?.slice(1);

  if (typeof xSignHeader !== "string") {
    return null;
  }

  if (
    !process.env.VK_SECURE_MODULI ||
    !process.env.VK_SECURE_SCHEDULE ||
    !process.env.VK_OL
  ) {
    return null;
  }

  const vk = checkVkSign(xSignHeader, [
    process.env.VK_SECURE_MODULI,
    process.env.VK_SECURE_SCHEDULE,
    process.env.VK_OL,
  ]);

  if (!vk) {
    if (!process.env.TEST_SIGN) {
      return null;
    }

    return checkTestSign(xSignHeader, process.env.TEST_SIGN);
  }

  return vk;
}

export const VkUserSchema = z.object({
  vk_user_id: z.string(),
  vk_app_id: z.string(),
  vk_is_app_user: z.string(),
  vk_are_notifications_enabled: z.string(),
  vk_language: z.string(),
  vk_access_token_settings: z.string(),
});

export type VkUser = z.infer<typeof VkUserSchema>;

export const VkTestUser = z.object({
  id: z.string(),
  sign: z.string(),
});

function checkTestSign(query: string, secretKey: string): VkUser | null {
  const splittedQuery = query
    .split("&")
    .map((param) => param.split("="))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  const parsedQuery = VkTestUser.safeParse(splittedQuery);

  if (!parsedQuery.success) {
    return null;
  }

  if (parsedQuery.data.sign === secretKey) {
    return {
      vk_user_id: parsedQuery.data.id,
      vk_app_id: "1",
      vk_is_app_user: "1",
      vk_are_notifications_enabled: "0",
      vk_language: "ru",
      vk_access_token_settings: "notify",
    };
  }

  return null;
}

function checkVkSign(
  query: string,
  secretKey: string | string[]
): VkUser | null {
  const urlParams = qs.parse(query);
  const ordered: Record<string, string> = {};
  Object.keys(urlParams)
    .sort()
    .forEach((key) => {
      if (key.slice(0, 3) === "vk_") {
        ordered[key] = urlParams[key] as string;
      }
    });

  const stringParams = qs.stringify(ordered);
  if (Array.isArray(secretKey)) {
    //    check if hash is ok for any of the keys
    const paramsHash = secretKey
      .map((key) =>
        crypto
          .createHmac("sha256", key)
          .update(stringParams)
          .digest()
          .toString("base64")
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=$/, "")
      )
      .find((hash) => hash === urlParams.sign);

    if (!paramsHash) {
      return null;
    }

    const parsedSchema = VkUserSchema.safeParse(urlParams);

    if (!parsedSchema.success) {
      return null;
    }

    return parsedSchema.data;
  }

  const paramsHash = crypto
    .createHmac("sha256", secretKey)
    .update(stringParams)
    .digest()
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=$/, "");

  if (paramsHash !== urlParams.sign) {
    return null;
  }

  const parsedSchema = VkUserSchema.safeParse(urlParams);

  if (!parsedSchema.success) {
    return null;
  }

  return parsedSchema.data;
}
