import { Entity, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm';
import { StudentOrmEntity } from '../student/student.orm-entity';

@Entity({ name: 'VkUser' })
export class VkUserOrmEntity {
  @PrimaryColumn()
  id: string;

  @ManyToMany(() => StudentOrmEntity, (student) => student.users)
  @JoinTable()
  students: StudentOrmEntity[];
}
