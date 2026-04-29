<template>
  <div class="categories-page">
    <h1 class="page-title">分类管理</h1>

    <!-- 搜索和新增 -->
    <div class="filter-bar">
      <div class="filter-left">
        <el-input
          v-model="keyword"
          placeholder="搜索分类名称"
          class="filter-input"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-button class="search-btn" @click="handleSearch">搜索</el-button>
      </div>
      <div class="filter-right">
        <el-button type="primary" class="add-btn" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增分类
        </el-button>
      </div>
    </div>

    <!-- 分类表格 -->
    <div class="table-card">
      <el-table
        v-loading="loading"
        :data="list"
        style="width: 100%"
        :border="false"
        :highlight-current-row="false"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" min-width="150">
          <template #default="scope">
            <span class="category-name">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="分类描述" min-width="200">
          <template #default="scope">
            <span class="category-desc">{{ scope.row.description || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <button class="action-btn action-edit" @click="handleEdit(row)">编辑</button>
            <button class="action-btn action-delete" @click="handleDelete(row.id)">删除</button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <div v-if="!loading && list.length === 0" class="empty-state">
        <div class="empty-icon">暂无分类</div>
        <el-button type="primary" @click="handleAdd">新增分类</el-button>
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

    <!-- 分类编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新增分类' : '编辑分类'"
      :width="dialogWidth"
      class="custom-dialog"
    >
      <el-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        label-width="100px"
        class="dialog-form"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" class="form-input" />
        </el-form-item>
        <el-form-item label="分类描述">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入分类描述"
            :rows="3"
            class="form-textarea"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="submitForm" class="submit-btn">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/admin/categories';
import type { Category } from '../../api/admin/categories';

// 响应式数据
const list = ref<Category[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const keyword = ref('');
const loading = ref(false);
const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const form = reactive({ id: null as number | null, name: '', description: '' });
const formRef = ref<FormInstance>();

// 弹窗宽度响应式
const dialogWidth = computed(() => {
  if (typeof window !== 'undefined') {
    if (window.innerWidth <= 767) return '95%';
    if (window.innerWidth <= 1199) return '90%';
  }
  return '400px';
});

// 表单验证规则
const formRules = reactive({
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 50, message: '分类名称长度应在 1 到 50 之间', trigger: 'blur' }
  ]
});

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

// 获取分类列表
const fetchCategories = async () => {
  loading.value = true;
  try {
    const response = await getCategories({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value
    });
    list.value = response.list;
    total.value = response.total;
  } catch (error: any) {
    ElMessage.error(error.message || '获取分类列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  page.value = 1;
  fetchCategories();
};

// 新增分类
const handleAdd = () => {
  dialogMode.value = 'create';
  form.id = null;
  form.name = '';
  form.description = '';
  dialogVisible.value = true;
};

// 编辑分类
const handleEdit = (row: Category) => {
  dialogMode.value = 'edit';
  form.id = row.id;
  form.name = row.name;
  form.description = row.description || '';
  dialogVisible.value = true;
};

// 删除分类
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个分类吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await deleteCategory(id);
    ElMessage.success('删除成功');
    fetchCategories();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败');
    }
  }
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    if (dialogMode.value === 'create') {
      await createCategory({ name: form.name, description: form.description });
      ElMessage.success('创建成功');
    } else {
      if (!form.id) return;
      await updateCategory(form.id, { name: form.name, description: form.description });
      ElMessage.success('更新成功');
    }

    dialogVisible.value = false;
    fetchCategories();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败');
    }
  }
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchCategories();
};

// 页码变化
const handleCurrentChange = (current: number) => {
  page.value = current;
  fetchCategories();
};

// 初始化
onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.categories-page {
  min-height: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #111827;
  margin: 0 0 24px 0;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-input {
  width: 220px;
  border-radius: 6px;
}

.search-btn {
  border-radius: 6px;
}

.add-btn {
  border-radius: 6px;
  background-color: #1E3A8A;
  border-color: #1E3A8A;
}

.add-btn:hover {
  background-color: #1E40AF;
  border-color: #1E40AF;
}

/* 表格卡片 */
.table-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* 表格样式 */
.table-card :deep(.el-table) {
  width: 100%;
}

.table-card :deep(.el-table__header) {
  background-color: #F3F4F6;
}

.table-card :deep(.el-table__header th) {
  height: 50px;
  font-weight: 600;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #E5E7EB;
  padding: 0 12px;
}

.table-card :deep(.el-table__body tr) {
  height: 50px;
}

.table-card :deep(.el-table__body tr:nth-child(even)) {
  background-color: #FAFAFA;
}

.table-card :deep(.el-table__body tr:hover) {
  background-color: #F3F4F6;
}

.table-card :deep(.el-table__body td) {
  padding: 0 12px;
  border-bottom: 1px solid #F3F4F6;
  color: #374151;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
}

.category-desc {
  font-size: 14px;
  color: #6B7280;
}

/* 操作按钮 */
.action-btn {
  font-size: 13px;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
  transition: background-color 0.2s linear;
}

.action-btn:last-child {
  margin-right: 0;
}

.action-edit {
  color: #1E3A8A;
  background-color: transparent;
}

.action-edit:hover {
  background-color: #EEF2FF;
}

.action-delete {
  color: #EF4444;
  background-color: transparent;
}

.action-delete:hover {
  background-color: #FEF2F2;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #9CA3AF;
}

.empty-icon {
  font-size: 16px;
  margin-bottom: 16px;
}

/* 分页 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 自定义弹窗 */
.custom-dialog :deep(.el-dialog) {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.custom-dialog :deep(.el-dialog__header) {
  background-color: #F3F4F6;
  border-radius: 8px 8px 0 0;
  padding: 16px 20px;
}

.custom-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.custom-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.custom-dialog :deep(.el-dialog__footer) {
  padding: 16px 20px;
  border-top: 1px solid #F3F4F6;
}

.dialog-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.dialog-form :deep(.el-form-item__label) {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  border-radius: 6px;
}

.form-input :deep(.el-input__wrapper) {
  border-radius: 6px;
}

.form-textarea {
  border-radius: 6px;
}

.form-textarea :deep(.el-textarea__inner) {
  border-radius: 6px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.cancel-btn {
  border-radius: 6px;
  background-color: #F3F4F6;
  border-color: #D1D5DB;
  color: #374151;
  padding: 8px 20px;
}

.cancel-btn:hover {
  background-color: #E5E7EB;
  border-color: #D1D5DB;
}

.submit-btn {
  border-radius: 6px;
  background-color: #1E3A8A;
  border-color: #1E3A8A;
  padding: 8px 20px;
}

.submit-btn:hover {
  background-color: #1E40AF;
  border-color: #1E40AF;
}

/* 响应式适配 */
@media (max-width: 767px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-left {
    order: 2;
  }

  .filter-right {
    order: 1;
  }

  .filter-input {
    width: 100%;
  }

  .add-btn {
    width: 100%;
  }

  .table-card {
    overflow-x: auto;
  }

  .dialog-footer {
    flex-direction: column;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .table-card {
    overflow-x: auto;
  }
}
</style>
