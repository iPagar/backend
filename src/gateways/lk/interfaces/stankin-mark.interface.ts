import { Module } from '../../../domain/entities/mark.entity';

export default interface StankinMark {
  factor: number;
  title: string;
  num: Module;
  value: number;
}
