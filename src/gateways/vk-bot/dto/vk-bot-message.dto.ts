export default class VkBotMessage {
  userId: number | string;

  message: string;

  attachment?: string | string[];

  keyboard?: VkBotKeyboard;

  sticker?: number | string;
}
