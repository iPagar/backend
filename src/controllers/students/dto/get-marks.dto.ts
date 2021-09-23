import { Module } from '../../../domain/entities/mark.entity';

export default class PartialMark {
  title: string;

  factor: number;

  num: Module;

  value: number;

  semester: string;

  constructor(
    title: string,
    factor: number,
    num: Module,
    value: number,
    semester: string
  ) {
    this.title = title;
    this.factor = factor;
    this.num = num;
    this.value = value;
    this.semester = semester;
  }
}
