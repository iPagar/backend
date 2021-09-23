export enum Module {
  'М1' = 'М1',
  'М2' = 'М2',
  'К' = 'К',
  'З' = 'З',
  'Э' = 'Э',
}

export default class Mark {
  private title: string;

  public getTitle(): string {
    return this.title;
  }

  public setTitle(value: string): void {
    this.title = value;
  }

  private factor: number;

  public getFactor(): number {
    return this.factor;
  }

  public setFactor(value: number): void {
    this.factor = value;
  }

  private num: Module;

  public getNum(): Module {
    return this.num;
  }

  public setNum(value: Module): void {
    this.num = value;
  }

  private value: number;

  public getValue(): number {
    return this.value;
  }

  public setValue(value: number): void {
    if (value >= 0 && value <= 100) {
      this.value = value;
    } else {
      throw new Error(
        'Mark should be greater or equal than 0 and less or equal than 100'
      );
    }
  }

  private semester: string;

  public getSemester(): string {
    return this.semester;
  }

  public setSemester(value: string): void {
    this.semester = value;
  }

  private card: string;

  setCard(card: string): void {
    this.card = card;
  }

  getCard(): string {
    return this.card;
  }

  constructor(
    title: string,
    value: number,
    factor: number,
    num: Module,
    semester: string,
    card: string
  ) {
    this.title = title;
    this.value = value;
    this.factor = factor;
    this.num = num;
    this.semester = semester;
    this.card = card;
  }
}
