<template>
  <div class="modern-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ 'collapsed': sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <i class="fas fa-briefcase"></i>
          <span v-if="!sidebarCollapsed" class="logo-text">JobMatch</span>
        </div>
        <button @click="toggleSidebar" class="sidebar-toggle">
          <i class="fas fa-bars"></i>
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <router-link to="/home" class="nav-item" active-class="active">
          <i class="fas fa-home"></i>
          <span v-if="!sidebarCollapsed">首页</span>
        </router-link>
        <router-link to="/login" class="nav-item" active-class="active">
          <i class="fas fa-sign-in-alt"></i>
          <span v-if="!sidebarCollapsed">登录</span>
        </router-link>
        <router-link to="/terms" class="nav-item" active-class="active">
          <i class="fas fa-file-contract"></i>
          <span v-if="!sidebarCollapsed">条款</span>
        </router-link>
        <router-link to="/privacy" class="nav-item" active-class="active">
          <i class="fas fa-shield-alt"></i>
          <span v-if="!sidebarCollapsed">隐私</span>
        </router-link>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <div class="main-content" :class="{ 'expanded': sidebarCollapsed }">
      <!-- 顶部导航 -->
      <header class="top-header">
        <div class="header-left">
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div class="header-right">
          <button @click="toggleTheme" class="theme-toggle">
            <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
          </button>
          <div class="user-menu">
            <i class="fas fa-user-circle"></i>
          </div>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="page-content">
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const sidebarCollapsed = ref(false)
const isDark = ref(false)

const pageTitle = computed(() => {
  const titles = {
    '/home': '工作匹配',
    '/login': '用户登录',
    '/terms': '服务条款',
    '/privacy': '隐私政策'
  }
  return titles[route.path] || '工作匹配系统'
})

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}
</script>

<style scoped>
.modern-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-secondary);
}

/* 侧边栏样式 */
.sidebar {
  width: 280px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
  color: white;
  transition: all 0.3s ease;
  position: fixed;
  height: 100vh;
  z-index: 1000;
  box-shadow: var(--shadow-lg);
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.logo i {
  font-size: 1.5rem;
}

.logo-text {
  transition: opacity 0.3s ease;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  transition: background-color 0.3s ease;
}

.sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-nav {
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-left-color: rgba(255, 255, 255, 0.5);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border-left-color: white;
}

.nav-item i {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  margin-left: 280px;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
}

.main-content.expanded {
  margin-left: 70px;
}

.top-header {
  background: var(--bg-primary);
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.theme-toggle {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 0.5rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: var(--secondary-color);
  color: var(--text-primary);
}

.user-menu {
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.3s ease;
}

.user-menu:hover {
  color: var(--primary-color);
}

.page-content {
  flex: 1;
  padding: 2rem;
  background: var(--bg-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.collapsed {
    transform: translateX(0);
    width: 100%;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .page-content {
    padding: 1rem;
  }
}
</style>
