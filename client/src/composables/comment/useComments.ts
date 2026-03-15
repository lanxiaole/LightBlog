/**
 * 评论管理组合式函数
 * 处理评论的获取、创建、删除、分页等逻辑
 */
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import { getComments, createComment, deleteComment as apiDeleteComment } from '@/api/comment';
import type { Comment } from '@/api/comment';
import { useUserStore } from '@/stores/user';

/**
 * 评论管理组合式函数
 * @param articleId 文章ID
 * @returns 评论相关的状态和方法
 */
export function useComments(articleId: number) {
  const router = useRouter();
  const userStore = useUserStore();

  // 评论列表
  const comments = ref<Comment[]>([]);
  // 评论总数
  const totalComments = ref(0);
  // 当前页码
  const commentPage = ref(1);
  // 每页数量
  const commentPageSize = ref(10);
  // 新评论内容
  const newComment = ref('');
  // 回复的评论ID
  const replyTo = ref<number | null>(null);
  // 提交状态
  const submitting = ref(false);
  // 评论加载状态
  const commentLoading = ref(false);

  /**
   * 计算评论树结构
   * 将平铺的评论列表转换为树形结构
   */
  const commentTree = computed(() => {
    const commentMap = new Map<number, Comment[]>();
    comments.value.forEach(comment => {
      const parentId = comment.parent_id || 0;
      if (!commentMap.has(parentId)) {
        commentMap.set(parentId, []);
      }
      commentMap.get(parentId)!.push(comment);
    });
    return commentMap.get(0) || [];
  });

  /**
   * 获取评论列表
   */
  const fetchComments = async () => {
    if (articleId <= 0) return;

    try {
      commentLoading.value = true;
      const response = await getComments(articleId, {
        page: commentPage.value,
        pageSize: commentPageSize.value
      });
      comments.value = response.list;
      totalComments.value = response.total;
    } catch (error: any) {
      ElMessage.error(error.message || '获取评论失败');
    } finally {
      commentLoading.value = false;
    }
  };

  /**
   * 发表评论
   */
  const handleCreateComment = async () => {
    if (articleId <= 0) return;

    if (!newComment.value.trim()) {
      ElMessage.warning('评论内容不能为空');
      return;
    }

    if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录');
      router.push('/login');
      return;
    }

    try {
      submitting.value = true;
      await createComment(articleId, {
        content: newComment.value.trim(),
        parent_id: replyTo.value || undefined
      });
      ElMessage.success('评论成功');
      commentPage.value = 1;
      await fetchComments();
      newComment.value = '';
      replyTo.value = null;
    } catch (error: any) {
      ElMessage.error(error.message || '发表评论失败');
    } finally {
      submitting.value = false;
    }
  };

  /**
   * 删除评论
   * @param commentId 评论ID
   */
  const handleDeleteComment = async (commentId: number) => {
    try {
      await ElMessageBox.confirm(
        '确定要删除这条评论吗？',
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );

      await apiDeleteComment(commentId);
      ElMessage.success('删除成功');
      await fetchComments();
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || '删除失败');
      }
    }
  };

  /**
   * 回复评论
   * @param commentId 评论ID
   */
  const handleReply = (commentId: number) => {
    replyTo.value = commentId;
    setTimeout(() => {
      const input = document.querySelector('.comment-input textarea') as HTMLTextAreaElement;
      if (input) {
        input.focus();
      }
    }, 100);
  };

  /**
   * 取消回复
   */
  const handleCancelReply = () => {
    replyTo.value = null;
  };

  /**
   * 分页切换
   * @param page 页码
   */
  const handlePageChange = (page: number) => {
    commentPage.value = page;
    fetchComments();
  };

  return {
    comments,            // 评论列表
    totalComments,       // 评论总数
    commentPage,         // 当前页码
    commentPageSize,     // 每页数量
    newComment,          // 新评论内容
    replyTo,             // 回复的评论ID
    submitting,          // 提交状态
    commentLoading,      // 评论加载状态
    commentTree,         // 评论树结构
    fetchComments,       // 获取评论列表
    handleCreateComment, // 发表评论
    handleDeleteComment, // 删除评论
    handleReply,         // 回复评论
    handleCancelReply,   // 取消回复
    handlePageChange     // 分页切换
  };
}
