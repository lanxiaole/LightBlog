<script setup lang="ts">
</script>

<template>
  <div class="default-layout">
    <header>公共头部</header>
    <main>
      <router-view />
    </main>
    <footer>公共底部</footer>
  </div>
</template>

<style scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  padding: 1rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e5e5e5;
}

main {
  flex: 1;
  padding: 1rem;
}

footer {
  padding: 1rem;
  background-color: #f5f5f5;
  border-top: 1px solid #e5e5e5;
  text-align: center;
}
</style>
