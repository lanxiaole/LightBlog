import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { updateUserProfile } from '@/api/user';

export function useSettings() {
  const router = useRouter();
  const userStore = useUserStore();

  const form = ref({
    username: '',
    email: '',
    bio: ''
  });

  const loading = ref(false);
  const formRef = ref();

  const formRules = ref({
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 20, message: '用户名长度应为3-20位', trigger: 'blur' },
      { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
    ]
  });

  const userAvatar = computed(() => userStore.userInfo?.avatar || '');
  const currentUsername = computed(() => userStore.userInfo?.username || '');

  const initForm = () => {
    if (userStore.userInfo) {
      form.value = {
        username: userStore.userInfo.username,
        email: userStore.userInfo.email || '',
        bio: userStore.userInfo.bio || ''
      };
    }
  };

  const handleSubmit = async (formEl: any) => {
    if (!formEl) return;

    await formEl.validate(async (valid: boolean) => {
      if (valid) {
        loading.value = true;
        try {
          await updateUserProfile({
            username: form.value.username,
            bio: form.value.bio
          });

          if (userStore.userInfo) {
            const isInLocalStorage = localStorage.getItem('token') === userStore.token;
            userStore.setUserInfo({
              ...userStore.userInfo,
              username: form.value.username,
              bio: form.value.bio
            }, isInLocalStorage);
          }

          ElMessage.success('更新成功');
          router.push(`/user/${form.value.username}`);
        } catch (error: any) {
          ElMessage.error(error.message || '更新失败');
        } finally {
          loading.value = false;
        }
      } else {
        return false;
      }
    });
  };

  const handleCancel = () => {
    router.push(`/user/${currentUsername.value}`);
  };

  const handleAvatarUploadSuccess = async (avatarUrl: string) => {
    try {
      await updateUserProfile({
        avatar: avatarUrl
      });

      if (userStore.userInfo) {
        const isInLocalStorage = localStorage.getItem('token') === userStore.token;
        userStore.setUserInfo({
          ...userStore.userInfo,
          avatar: avatarUrl
        }, isInLocalStorage);
      }

      ElMessage.success('头像更新成功！');
    } catch (error: any) {
      ElMessage.error(error.message || '更新失败');
    }
  };

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
    handleAvatarUploadSuccess
  };
}
