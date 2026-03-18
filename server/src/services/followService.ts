/**
 * 关注服务
 * 处理用户关注相关的业务逻辑
 */
import { FollowModel } from '../models/Follow';
import { UserModel } from '../models/User';
import { NotificationModel } from '../models/Notification';

/**
 * 关注服务
 */
export const FollowService = {
  /**
   * 关注用户
   * @param followerId 关注者ID
   * @param followingId 被关注者ID
   * @returns 关注者的关注数量和被关注者的粉丝数量
   * @throws 当尝试关注自己时抛出错误
   * @throws 当被关注者不存在时抛出错误
   * @throws 当关注失败时抛出错误
   */
  async follow(followerId: number, followingId: number): Promise<{ followingCount: number; followersCount: number }> {
    if (followerId === followingId) {
      throw new Error('不能关注自己');
    }

    const followingUser = await UserModel.findUserById(followingId);
    if (!followingUser) {
      throw new Error('被关注者不存在');
    }

    const success = await FollowModel.follow(followerId, followingId);

    if (success) {
      NotificationModel.createNotification({
        type: 'follow',
        sender_id: followerId,
        receiver_id: followingId
      }).catch(error => {
        console.error('创建关注通知失败:', error);
      });

      const followingCount = await FollowModel.getFollowingCount(followerId);
      const followersCount = await FollowModel.getFollowersCount(followingId);

      return {
        followingCount,
        followersCount
      };
    }

    throw new Error('关注失败');
  },

  /**
   * 取消关注
   * @param followerId 关注者ID
   * @param followingId 被关注者ID
   * @returns 关注者的关注数量和被关注者的粉丝数量
   * @throws 当被关注者不存在时抛出错误
   * @throws 当关注记录不存在时抛出错误
   */
  async unfollow(followerId: number, followingId: number): Promise<{ followingCount: number; followersCount: number }> {
    const followingUser = await UserModel.findUserById(followingId);
    if (!followingUser) {
      throw new Error('被关注者不存在');
    }

    const success = await FollowModel.unfollow(followerId, followingId);

    if (success) {
      const followingCount = await FollowModel.getFollowingCount(followerId);
      const followersCount = await FollowModel.getFollowersCount(followingId);

      return {
        followingCount,
        followersCount
      };
    }

    throw new Error('关注记录不存在');
  },

  /**
   * 获取用户的粉丝列表
   * @param userId 用户ID
   * @param page 页码，默认1
   * @param pageSize 每页数量，默认10
   * @returns 粉丝列表
   * @throws 当用户不存在时抛出错误
   */
  async getFollowers(userId: number, page: number = 1, pageSize: number = 10) {
    const user = await UserModel.findUserById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    return await FollowModel.getFollowers(userId, page, pageSize);
  },

  /**
   * 获取用户的关注列表
   * @param userId 用户ID
   * @param page 页码，默认1
   * @param pageSize 每页数量，默认10
   * @returns 关注列表
   * @throws 当用户不存在时抛出错误
   */
  async getFollowing(userId: number, page: number = 1, pageSize: number = 10) {
    const user = await UserModel.findUserById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    return await FollowModel.getFollowing(userId, page, pageSize);
  },

  /**
   * 检查是否关注
   * @param followerId 关注者ID
   * @param followingId 被关注者ID
   * @returns 是否关注
   * @throws 当目标用户不存在时抛出错误
   */
  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const targetUser = await UserModel.findUserById(followingId);
    if (!targetUser) {
      throw new Error('目标用户不存在');
    }

    return await FollowModel.isFollowing(followerId, followingId);
  }
};