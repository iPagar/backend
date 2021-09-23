import faker from 'faker';
import Mark, { Module } from '../mark.entity';

describe('Mark', () => {
  let mark: Mark;
  let title: string;
  let semester: string;
  let factor: number;
  let num: Module;
  let value: number;

  beforeEach(() => {
    semester = `${faker.datatype
      .number({ min: 2010, max: 2030 })
      .toString()}-${faker.datatype.string(5)}`;
    title = faker.random.word();
    factor = faker.datatype.number({ min: 1, max: 4 });
    num = Module.М1;
    value = faker.datatype.number({ min: 25, max: 54 });
    mark = new Mark(title, value, factor, num, semester);
  });

  it('should have semester, title, factor, num and value', () => {
    expect(mark.title).toBe(title);
    expect(mark.semester).toBe(semester);
    expect(mark.factor).toBe(factor);
    expect(mark.num).toBe(num);
    expect(mark.value).toBe(value);
  });
});
