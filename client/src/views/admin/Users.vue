<template>
  <div class="users-page">
    <h1 class="page-title">用户管理</h1>

    <!-- 搜索和新增 -->
    <div class="filter-bar">
      <div class="filter-left">
        <el-input
          v-model="keyword"
          placeholder="搜索用户名或邮箱"
          class="filter-input"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-button class="search-btn" @click="handleSearch">搜索</el-button>
      </div>

    </div>

    <!-- 用户表格 -->
    <div class="table-card">
      <el-table
        v-loading="loading"
        :data="list"
        style="width: 100%"
        :border="false"
        :highlight-current-row="false"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="150">
          <template #default="scope">
            <el-tooltip :content="scope.row.username" placement="top">
              <span class="user-name">{{ scope.row.username }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="200">
          <template #default="scope">
            <el-tooltip :content="scope.row.email" placement="top">
              <span class="user-email">{{ scope.row.email }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag :class="getRoleTagClass(row.role)">
              {{ row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="账号状态" width="120">
          <template #default="{ row }">
            <el-tag :class="getStatusTagClass(row.is_active)">
              {{ row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">

            <button
              class="action-btn action-status"
              @click="handleStatusChange(row.id, !row.is_active)"
            >
              {{ row.is_active ? '禁用' : '启用' }}
            </button>
            <button class="action-btn action-reset" @click="handleResetPassword(row.id)">
              重置密码
            </button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <div v-if="!loading && list.length === 0" class="empty-state">
        <div class="empty-icon">暂无用户</div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElTooltip } from 'element-plus';
import { getUsers, toggleUserStatus, resetUserPassword } from '@/api/admin/users';
import type { AdminUser } from '@/api/admin/users';

// 响应式数据
const list = ref<AdminUser[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const keyword = ref('');
const loading = ref(false);

// 获取角色标签样式类
const getRoleTagClass = (role: string): string => {
  return role === 'admin' ? 'role-tag admin' : 'role-tag user';
};

// 获取状态标签样式类
const getStatusTagClass = (isActive: boolean): string => {
  return isActive ? 'status-tag active' : 'status-tag disabled';
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

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true;
  try {
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

// 分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchUsers();
};

// 页码变化
const handleCurrentChange = (current: number) => {
  page.value = current;
  fetchUsers();
};

// 初始化
onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
@import './Users.scss';
</style>
