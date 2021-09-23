import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { StudentOrmEntity } from '../student/student.orm-entity';

@Entity({ name: 'Mark' })
export class MarkOrmEntity {
  @PrimaryColumn()
  subject: string;

  @Column({ type: 'float', scale: 1 })
  factor: number;

  @PrimaryColumn()
  module: string;

  @Column()
  value: number;

  @PrimaryColumn()
  semester: string;

  @ManyToOne(() => StudentOrmEntity, (card) => card.marks, {
    primary: true,
    cascade: true,
  })
  card: string;
}
