<template>
  <div class="tags-page">
    <h1 class="page-title">标签管理</h1>

    <!-- 搜索和新增 -->
    <div class="filter-bar">
      <div class="filter-left">
        <el-input
          v-model="keyword"
          placeholder="搜索标签名称"
          class="filter-input"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-button class="search-btn" @click="handleSearch">搜索</el-button>
      </div>
      <div class="filter-right">
        <el-button type="primary" class="add-btn" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增标签
        </el-button>
      </div>
    </div>

    <!-- 标签表格 -->
    <div class="table-card">
      <el-table
        v-loading="loading"
        :data="list"
        style="width: 100%"
        :border="false"
        :highlight-current-row="false"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="标签名称" min-width="150">
          <template #default="scope">
            <span class="tag-name">{{ scope.row.name }}</span>
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
        <div class="empty-icon">暂无标签</div>
        <el-button type="primary" @click="handleAdd">新增标签</el-button>
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

    <!-- 标签编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新增标签' : '编辑标签'"
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
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入标签名称" class="form-input" />
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
import { getTags, createTag, updateTag, deleteTag } from '../../api/admin/tags';
import type { Tag } from '../../api/admin/tags';

// 响应式数据
const list = ref<Tag[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const keyword = ref('');
const loading = ref(false);
const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const form = reactive({ id: null as number | null, name: '' });
const formRef = ref<FormInstance>();

// 弹窗宽度响应式
const dialogWidth = computed(() => {
  if (typeof window !== 'undefined') {
    if (window.innerWidth <= 767) return '95%';
    if (window.innerWidth <= 1199) return '90%';
  }
  return '350px';
});

// 表单验证规则
const formRules = reactive({
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 50, message: '标签名称长度应在 1 到 50 之间', trigger: 'blur' }
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

// 获取标签列表
const fetchTags = async () => {
  loading.value = true;
  try {
    const response = await getTags({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value
    });
    list.value = response.list;
    total.value = response.total;
  } catch (error: any) {
    ElMessage.error(error.message || '获取标签列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  page.value = 1;
  fetchTags();
};

// 新增标签
const handleAdd = () => {
  dialogMode.value = 'create';
  form.id = null;
  form.name = '';
  dialogVisible.value = true;
};

// 编辑标签
const handleEdit = (row: Tag) => {
  dialogMode.value = 'edit';
  form.id = row.id;
  form.name = row.name;
  dialogVisible.value = true;
};

// 删除标签
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个标签吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await deleteTag(id);
    ElMessage.success('删除成功');
    fetchTags();
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
      await createTag(form.name);
      ElMessage.success('创建成功');
    } else {
      if (!form.id) return;
      await updateTag(form.id, form.name);
      ElMessage.success('更新成功');
    }

    dialogVisible.value = false;
    fetchTags();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败');
    }
  }
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchTags();
};

// 页码变化
const handleCurrentChange = (current: number) => {
  page.value = current;
  fetchTags();
};

// 初始化
onMounted(() => {
  fetchTags();
});
</script>

<style scoped>
@import './Tags.scss';
</style>
