export enum App {
  VK = 'VK',
  Site = 'Site',
}

export default class User {
  protected app: App;

  public setApp(app: App): void {
    this.app = app;
  }

  public getApp(): App {
    return this.app;
  }

  private id: string;

  public getId(): string {
    return this.id;
  }

  public setId(id: string): void {
    this.id = id;
  }

  protected cards: string[] = [];

  public setCards(cards: string[]): void {
    this.cards = cards;
  }

  public getCards(): string[] {
    return this.cards;
  }
}
