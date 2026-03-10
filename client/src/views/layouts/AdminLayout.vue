<script setup lang="ts">
</script>

<template>
  <div class="admin-layout">
    <aside class="sidebar">管理菜单</aside>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 200px;
  padding: 1rem;
  background-color: #f5f5f5;
  border-right: 1px solid #e5e5e5;
}

main {
  flex: 1;
  padding: 1rem;
}
</style>