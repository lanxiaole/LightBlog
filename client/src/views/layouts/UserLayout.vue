<script setup lang="ts">
</script>

<template>
  <div class="user-layout">
    <div class="user-info">用户信息</div>
    <nav>
      <router-link to="/user/:username">文章</router-link>
      <router-link to="/user/:username/followers">关注者</router-link>
      <router-link to="/user/:username/following">关注中</router-link>
      <router-link to="/user/:username/about">关于</router-link>
    </nav>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.user-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.user-info {
  padding: 1rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e5e5e5;
}

nav {
  padding: 1rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e5e5e5;
}

nav a {
  margin-right: 1rem;
}

main {
  flex: 1;
  padding: 1rem;
}
</style>