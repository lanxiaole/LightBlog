<template>
  <div class="users-container">
    <h2 class="page-title">用户管理</h2>

    <el-card class="search-card" shadow="never">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="keyword"
            placeholder="搜索邮箱或用户名"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="username" label="用户名" min-width="150" />
        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'info'">
              {{ row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'danger'">
              {{ row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              :type="row.is_active ? 'warning' : 'success'"
              size="small"
              @click="handleStatusChange(row.id, !row.is_active)"
            >
              {{ row.is_active ? '禁用' : '启用' }}
            </el-button>
            <el-button
              type="primary"
              size="small"
              @click="handleResetPassword(row.id)"
            >
              重置密码
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && list.length === 0" description="暂无用户数据" />

      <div v-if="total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElButton, ElInput, ElTable, ElTableColumn, ElTag, ElPagination, ElMessage, ElCard, ElRow, ElCol, ElEmpty } from 'element-plus';
import { getUsers, toggleUserStatus, resetUserPassword } from '@/api/admin/users';
import type { AdminUser } from '@/api/admin/users';

// 响应式数据
const list = ref<AdminUser[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const keyword = ref('');
const loading = ref(false);

// 获取用户列表
const fetchUsers = async () => {
  try {
    loading.value = true;
    const response = await getUsers({
      keyword: keyword.value,
      page: page.value,
      pageSize: pageSize.value
    });
    list.value = response.list;
    total.value = response.total;
  } catch (error: any) {
    ElMessage.error(error.message || '获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  page.value = 1;
  fetchUsers();
};

// 切换用户状态
const handleStatusChange = async (userId: number, isActive: boolean) => {
  try {
    await toggleUserStatus(userId, isActive);
    ElMessage.success('状态更新成功');
    fetchUsers();
  } catch (error: any) {
    ElMessage.error(error.message || '状态更新失败');
  }
};

// 重置密码
const handleResetPassword = async (userId: number) => {
  try {
    const response = await resetUserPassword(userId);
    ElMessage.success(`新密码：${response.newPassword}`);
  } catch (error: any) {
    ElMessage.error(error.message || '重置密码失败');
  }
};

// 分页切换
const handlePageChange = (newPage: number) => {
  page.value = newPage;
  fetchUsers();
};

const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  page.value = 1;
  fetchUsers();
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 挂载时获取数据
onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.users-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-title {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  min-height: 500px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
