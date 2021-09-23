import Student from '../student.entity';
import User, { App } from '../user.entity';

describe('User', () => {
  let user: User;
  let cards: string[];
  let app: App;

  beforeEach(() => {
    cards = [];
    app = App.VK;

    user = new User();
  });

  it('should create a user', () => {
    expect(user).toBeDefined();
  });

  it('should have cards', () => {
    user.setCards(cards);

    expect(user.getCards()).toEqual(expect.arrayContaining(cards));
  });

  it('should have app', () => {
    user.setApp(app);

    expect(user.getApp()).toBe(app);
  });
});
