import { Column, Entity, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm';
import { MarkOrmEntity } from '../mark/mark.orm-entity';
import { VkUserOrmEntity } from '../user/vk-user.orm-entity';

@Entity({ name: 'Student' })
export class StudentOrmEntity {
  @PrimaryColumn()
  card: string;

  @Column()
  password: string;

  @Column()
  surname: string;

  @Column()
  initials: string;

  @Column()
  group: string;

  @OneToMany(() => MarkOrmEntity, (mark) => mark.card)
  marks: MarkOrmEntity[];

  @ManyToMany(() => VkUserOrmEntity, (user) => user.students)
  users: VkUserOrmEntity[];
}
