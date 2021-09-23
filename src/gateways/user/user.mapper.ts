import { Service } from 'typedi';
import VkUser from '../../domain/entities/vk-user.entity';
import { VkUserOrmEntity } from './vk-user.orm-entity';

@Service()
export default class UserMapper {
  mapVkUserOrmToVkUser(vkUserOrmEntity: VkUserOrmEntity): VkUser {
    const vkUser = new VkUser(vkUserOrmEntity.id);
    vkUser.setCards(vkUserOrmEntity.students?.map((student) => student.card));

    return vkUser;
  }
}
