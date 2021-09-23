import User, { App } from './user.entity';

export default class VkUser extends User {
  constructor(id: string) {
    super();

    this.setId(id);
    this.app = App.VK;
  }
}
