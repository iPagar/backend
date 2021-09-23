import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import Mark, { Module } from '../../domain/entities/mark.entity';
import { MarkOrmEntity } from './mark.orm-entity';

@Service()
export default class MarkMapper {
  constructor(
    @InjectRepository(MarkOrmEntity)
    private _markOrmRepository: Repository<MarkOrmEntity>
  ) {}

  mapMarkOrmToMark(markOrm: MarkOrmEntity, card: string): Mark {
    const { module, value, factor, subject, semester } = markOrm;
    const mark = new Mark(
      subject,
      value,
      factor,
      module as Module,
      semester,
      card
    );

    return mark;
  }

  mapMarkToMarkOrm(mark: Mark, card: string): MarkOrmEntity {
    const markOrm = this._markOrmRepository.create();
    markOrm.factor = mark.getFactor();
    markOrm.semester = mark.getSemester();
    markOrm.subject = mark.getTitle();
    markOrm.value = mark.getValue();
    markOrm.module = mark.getNum().toString();
    markOrm.card = card;

    return markOrm;
  }
}
