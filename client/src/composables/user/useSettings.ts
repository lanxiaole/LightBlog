import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { updateUserProfile } from '@/api/user';

/**
 * 设置页面逻辑 Composable
 * 提供用户资料编辑页面的状态管理和操作方法
 */
export function useSettings() {
  // 获取路由实例
  const router = useRouter();
  
  // 获取用户 store
  const userStore = useUserStore();

  /** 表单数据 */
  const form = ref({
    username: '',
    bio: ''
  });

  /** 加载状态 */
  const loading = ref(false);

  /** 表单引用 */
  const formRef = ref();

  /** 表单验证规则 */
  const formRules = ref({
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 20, message: '用户名长度应为3-20位', trigger: 'blur' },
      { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
    ]
  });

  /**
   * 计算属性：当前用户头像
   */
  const userAvatar = computed(() => userStore.userInfo?.avatar || '');

  /**
   * 计算属性：当前用户名
   */
  const currentUsername = computed(() => userStore.userInfo?.username || '');

  /**
   * 初始化表单数据
   */
  const initForm = () => {
    if (userStore.userInfo) {
      form.value = {
        username: userStore.userInfo.username,
        bio: userStore.userInfo.bio || ''
      };
    }
  };

  /**
   * 提交表单
   * @param formEl 表单元素引用
   */
  const handleSubmit = async (formEl: any) => {
    if (!formEl) return;

    await formEl.validate(async (valid: boolean) => {
      if (valid) {
        loading.value = true;
        try {
          // 调用 API 更新用户资料
          await updateUserProfile({
            username: form.value.username,
            bio: form.value.bio
          });

          // 更新 userStore 中的用户信息
          if (userStore.userInfo) {
            userStore.setUserInfo({
              ...userStore.userInfo,
              username: form.value.username,
              bio: form.value.bio
            });
          }

          // 显示成功消息
          ElMessage.success('更新成功');

          // 跳转到个人主页
          router.push(`/user/${form.value.username}`);
        } catch (error: any) {
          // 显示错误消息
          ElMessage.error(error.message || '更新失败');
        } finally {
          loading.value = false;
        }
      } else {
        return false;
      }
    });
  };

  /**
   * 取消编辑，返回个人主页
   */
  const handleCancel = () => {
    router.push(`/user/${currentUsername.value}`);
  };

  /**
   * 处理头像上传（暂不实现具体上传功能）
   */
  const handleAvatarUpload = () => {
    ElMessage.info('头像上传功能暂未实现');
  };

  // 组件挂载时初始化表单数据
  onMounted(() => {
    initForm();
  });

  return {
    form,
    loading,
    formRef,
    formRules,
    userAvatar,
    currentUsername,
    handleSubmit,
    handleCancel,
    handleAvatarUpload
  };
}
