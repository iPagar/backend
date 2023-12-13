import { VK } from "vk-io";

export const vkService = new VK({
  token: process.env.VK_SERVICE_TOKEN!,
  language: "ru",
});

export const vkGroup = new VK({
  token: process.env.VK_GROUP_TOKEN!,
  language: "ru",
});
