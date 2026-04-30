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
            <div ref="userChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>近7天文章发布趋势</span>
              </div>
            </template>
            <div ref="articleChartRef" class="chart-container"></div>
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
import { ref, onMounted, onUnmounted } from 'vue';
import { getStats } from '@/api/admin';
import type { Stats } from '@/api/admin';
import * as echarts from 'echarts';

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

// 图表引用
const userChartRef = ref<HTMLElement | null>(null);
const articleChartRef = ref<HTMLElement | null>(null);

// 图表实例
let userChart: echarts.ECharts | null = null;
let articleChart: echarts.ECharts | null = null;

// 初始化用户增长趋势图表
const initUserChart = () => {
  if (userChartRef.value) {
    userChart = echarts.init(userChartRef.value);
    updateUserChart();
  }
};

// 初始化文章发布趋势图表
const initArticleChart = () => {
  if (articleChartRef.value) {
    articleChart = echarts.init(articleChartRef.value);
    updateArticleChart();
  }
};

// 更新用户增长趋势图表
const updateUserChart = () => {
  if (!userChart) return;

  const dates = stats.value.last7DaysUserTrend.map(item => {
    // 格式化日期，只显示日期部分
    const date = new Date(item.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  const counts = stats.value.last7DaysUserTrend.map(item => item.count);

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [
      {
        name: '新增用户',
        type: 'line',
        data: counts,
        smooth: true,
        lineStyle: {
          color: '#409eff'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(64, 158, 255, 0.5)'
            },
            {
              offset: 1,
              color: 'rgba(64, 158, 255, 0.1)'
            }
          ])
        }
      }
    ]
  };

  userChart.setOption(option);
};

// 更新文章发布趋势图表
const updateArticleChart = () => {
  if (!articleChart) return;

  const dates = stats.value.last7DaysArticleTrend.map(item => {
    // 格式化日期，只显示日期部分
    const date = new Date(item.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  const counts = stats.value.last7DaysArticleTrend.map(item => item.count);

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [
      {
        name: '发布文章',
        type: 'line',
        data: counts,
        smooth: true,
        lineStyle: {
          color: '#67c23a'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(103, 194, 58, 0.5)'
            },
            {
              offset: 1,
              color: 'rgba(103, 194, 58, 0.1)'
            }
          ])
        }
      }
    ]
  };

  articleChart.setOption(option);
};

// 处理窗口 resize
const handleResize = () => {
  userChart?.resize();
  articleChart?.resize();
};

// 挂载时获取数据并初始化图表
onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;

    // 获取统计数据
    const data = await getStats();
    stats.value = data;

    // 初始化图表
    setTimeout(() => {
      initUserChart();
      initArticleChart();
      window.addEventListener('resize', handleResize);
    }, 100);
  } catch (err: any) {
    error.value = err.message || '获取统计数据失败';
  } finally {
    loading.value = false;
  }
});

// 卸载时销毁图表
onUnmounted(() => {
  userChart?.dispose();
  articleChart?.dispose();
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
@import './Dashboard.scss';
</style>
