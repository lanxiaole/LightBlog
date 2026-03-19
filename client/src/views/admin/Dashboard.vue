<template>
  <div class="dashboard-container">
    <h2 class="dashboard-title">仪表盘</h2>

    <!-- 加载状态 -->
    <el-skeleton :loading="loading" animated>
      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-card class="stats-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>总用户</span>
              </div>
            </template>
            <div class="stats-value">{{ stats.userCount }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>总文章</span>
              </div>
            </template>
            <div class="stats-value">{{ stats.articleCount }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>总评论</span>
              </div>
            </template>
            <div class="stats-value">{{ stats.commentCount }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>今日新增</span>
              </div>
            </template>
            <div class="stats-value today">{{ stats.todayNewUsers }}</div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 趋势数据 -->
      <el-row :gutter="20" class="charts-row">
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>近7天用户增长趋势</span>
              </div>
            </template>
            <el-table :data="stats.last7DaysUserTrend" style="width: 100%">
              <el-table-column prop="date" label="日期" width="120" />
              <el-table-column prop="count" label="新增用户" />
            </el-table>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>近7天文章发布趋势</span>
              </div>
            </template>
            <el-table :data="stats.last7DaysArticleTrend" style="width: 100%">
              <el-table-column prop="date" label="日期" width="120" />
              <el-table-column prop="count" label="发布文章" />
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </el-skeleton>

    <!-- 错误提示 -->
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      class="error-alert"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getStats } from '@/api/admin';
import type { Stats } from '@/api/admin';
// import * as echarts from 'echarts';

// 响应式数据
const loading = ref(true);
const error = ref<string | null>(null);
const stats = ref<Stats>({
  userCount: 0,
  articleCount: 0,
  commentCount: 0,
  todayNewUsers: 0,
  last7DaysUserTrend: [],
  last7DaysArticleTrend: []
});

// 挂载时获取数据
onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;

    // 获取统计数据
    const data = await getStats();
    stats.value = data;
  } catch (err: any) {
    error.value = err.message || '获取统计数据失败';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.dashboard-title {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  height: 120px;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.card-header span {
  font-size: 14px;
  color: #606266;
}

.stats-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-top: auto;
}

.stats-value.today {
  color: #67c23a;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
}

.chart-container {
  width: 100%;
  height: calc(100% - 40px);
}

.error-alert {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .el-col {
    width: 100%;
  }

  .stats-row .el-col {
    margin-bottom: 20px;
  }

  .charts-row .el-col {
    margin-bottom: 20px;
  }
}
</style>
