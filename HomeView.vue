<template>
  <Layout>
    <div class="home-container">
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-briefcase"></i>
          </div>
          <div class="stat-content">
            <h3>{{ totalItems }}</h3>
            <p>总需求数</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon success">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <h3>{{ supplyList.length }}</h3>
            <p>简历数量</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="stat-content">
            <h3>{{ editingDemand.match_percent || 0 }}%</h3>
            <p>匹配进度</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon info">
            <i class="fas fa-comments"></i>
          </div>
          <div class="stat-content">
            <h3>{{ chatMessages.length }}</h3>
            <p>聊天消息</p>
          </div>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="main-grid">
        <!-- 左侧内容 -->
        <div class="left-panel">
          <!-- 操作按钮组 -->
          <div class="action-buttons">
            <button class="modern-btn primary" @click="showAddDemandModal">
              <i class="fas fa-plus"></i>
              新增需求
            </button>
            <button class="modern-btn secondary" @click="updateActive">
              <i class="fas fa-toggle-on"></i>
              {{ activeName }}
            </button>
            <button class="modern-btn success" @click="match" :disabled="matchLoading">
              <i class="fas fa-magic" :class="{ 'fa-spin': matchLoading }"></i>
              {{ matchLoading ? '分析中...' : '开始匹配' }}
            </button>
          </div>

          <!-- 需求列表 -->
          <div class="content-card" v-if="!viewResume">
            <div class="card-header">
              <h3>需求列表</h3>
              <div class="header-actions">
                <select v-model="pageSize" @change="handlePageSizeChange" class="modern-select">
                  <option v-for="size in pageSizeOptions" :key="size" :value="size">
                    {{ size }} 条/页
                  </option>
                </select>
              </div>
            </div>

            <div class="table-container">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>需求描述</th>
                    <th>创建时间</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in demandList" :key="item.id" class="table-row">
                    <td>{{ item.id }}</td>
                    <td>
                      <div class="demand-text">{{ truncateText(item.demand_txt, 50) }}</div>
                    </td>
                    <td>{{ formatDate(item.created_at) }}</td>
                    <td>
                      <span class="status-badge" :class="item.active ? 'active' : 'inactive'">
                        {{ item.active ? '激活' : '未激活' }}
                      </span>
                    </td>
                    <td>
                      <div class="action-buttons-small">
                        <button @click="viewResumeList(item, pageSize, 1, true, scoreSortOrder, true, '')"
                                class="btn-small primary">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button @click="handleCheckboxClickDemand(item)"
                                class="btn-small"
                                :class="item.active ? 'success' : 'secondary'">
                          <i :class="item.active ? 'fas fa-toggle-on' : 'fas fa-toggle-off'"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 分页 -->
            <div class="pagination-container">
              <div class="pagination-info">
                共 {{ totalItems }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页
              </div>
              <div class="pagination-controls">
                <button @click="changePage(currentPage - 1)"
                        :disabled="currentPage === 1"
                        class="pagination-btn">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <button v-for="page in Math.min(totalPages, 5)"
                        :key="page"
                        @click="changePage(page)"
                        class="pagination-btn"
                        :class="{ 'active': page === currentPage }">
                  {{ page }}
                </button>
                <button @click="changePage(currentPage + 1)"
                        :disabled="currentPage === totalPages"
                        class="pagination-btn">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- 简历列表 -->
          <div class="content-card" v-else>
            <div class="card-header">
              <h3>简历列表</h3>
              <div class="header-actions">
                <button @click="viewSupplyList" class="modern-btn secondary">
                  <i class="fas fa-arrow-left"></i>
                  返回需求
                </button>
                <button @click="showUploadModal" class="modern-btn primary">
                  <i class="fas fa-upload"></i>
                  上传简历
                </button>
              </div>
            </div>

            <!-- 角色筛选 -->
            <div class="role-filter" v-if="role_list.length > 0">
              <button v-for="role in role_list"
                      :key="role"
                      @click="selectRole(role)"
                      class="role-btn"
                      :class="{ 'active': demand_role_name === role }">
                {{ role }}
              </button>
            </div>

            <div class="table-container">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>角色</th>
                    <th>专业</th>
                    <th>国籍</th>
                    <th>价格</th>
                    <th>日语水平</th>
                    <th>匹配度</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in supplyList" :key="item.id" class="table-row">
                    <td>{{ item.id }}</td>
                    <td>{{ item.role || '-' }}</td>
                    <td>{{ item.specialty || '-' }}</td>
                    <td>{{ item.citizenship || '-' }}</td>
                    <td>{{ item.price || '-' }}</td>
                    <td>{{ item.japanese_level || '-' }}</td>
                    <td>
                      <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: item.percent + '%' }"></div>
                        <span class="progress-text">{{ item.percent }}%</span>
                      </div>
                    </td>
                    <td>
                      <div class="action-buttons-small">
                        <button @click="supplyPreview(item)" class="btn-small primary">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button @click="editSupply(item)" class="btn-small secondary">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button @click="deleteSupply(item.id)" class="btn-small danger">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 右侧聊天面板 -->
        <div class="chat-panel">
          <div class="chat-header">
            <h3>智能助手</h3>
            <i class="fas fa-robot"></i>
          </div>

          <div class="chat-messages" ref="chatContainer">
            <div v-for="(msg, i) in chatMessages" :key="i" class="message"
                 :class="{ 'user': msg.sender === '用户', 'system': msg.sender !== '用户' }">
              <div class="message-content">
                <div v-if="!msg.type">{{ msg.text }}</div>
                <div v-else>
                  <a @click="chatDataOpen(msg.body, false)" class="data-link">
                    <i class="fas fa-table"></i>
                    点击查看数据
                  </a>
                  <a @click="chatDataOpen(msg.body, true)" class="download-link">
                    <i class="fas fa-download"></i>
                    下载
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="chat-input">
            <textarea v-model="newMessage"
                      placeholder="输入您的问题..."
                      class="message-input"
                      @keydown.enter.prevent="sendMessage"></textarea>
            <button @click="sendMessage"
                    :disabled="sending || !newMessage.trim()"
                    class="send-btn">
              <i :class="sending ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane'"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import Layout from '../components/Layout.vue'
import type { DemandItem, SupplyItem } from '../types/matchModels'
import { createDefaultDemand, createDefaultSupply } from '../types/matchModels'
import * as matchApi from '../api/matchApi'
import i18n from '../locales/index.js'

// 引入原有的所有响应式变量和函数
const router = useRouter()
const demandList = ref<DemandItem[]>([])
const supplyList = ref<SupplyItem[]>([])
const newDemand = ref<DemandItem>(createDefaultDemand())
const editingDemand = ref<DemandItem>(createDefaultDemand())
const editingSupply = ref<SupplyItem>(createDefaultSupply())
const viewResume = ref(false)
const sending = ref(false)
const active = ref(true)
const activeName = ref('激活状态')
const totalItems = ref(0)
const totalPages = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const pageSizeOptions = [10, 20, 50]
const scoreSortOrder = ref('-score')
const supplyIsUploading = ref(false)
const demandIsUploading = ref(false)
const matchLoading = ref(false)
const role_list = ref([])
const demand_role_name = ref('')
const chatMessages = ref([])
const newMessage = ref('')
const conversationId = ref('')
const chatContainer = ref(null)

// 用户信息
const user = ref({
  email: "",
  origin_id: "",
  username: ""
})

// 工具函数
function truncateText(text: string, length = 13) {
  if (!text) return ''
  const cleanedText = text.replace(/\s+/g, '')
  if (cleanedText.length > length) {
    return cleanedText.substring(0, length) + '...'
  }
  return cleanedText
}

function formatDate(date: string) {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = ("0" + (d.getMonth() + 1)).slice(-2)
  const day = ("0" + d.getDate()).slice(-2)
  return `${year}-${month}-${day}`
}

// 页面初始化
onMounted(async () => {
  await refreshDemand(pageSize.value, currentPage.value)
  const res = await matchApi.getUserInfo()
  const data = await res.json()
  user.value = {
    email: data.result.email,
    origin_id: data.result.origin_id,
    username: data.result.username
  }
  getMessages()
})

// 基础函数实现（简化版）
async function refreshDemand(pageSize: number, currentPage: number) {
  // 模拟数据
  demandList.value = [
    { id: 1, demand_txt: '需要一名前端开发工程师，熟悉Vue.js和TypeScript', created_at: '2025-05-27', active: true },
    { id: 2, demand_txt: '招聘后端开发工程师，精通Node.js和数据库设计', created_at: '2025-05-26', active: false },
    { id: 3, demand_txt: '寻找UI/UX设计师，有丰富的移动端设计经验', created_at: '2025-05-25', active: true }
  ]
  totalItems.value = 3
  totalPages.value = 1
}

async function changePage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    if (viewResume.value) {
      await refreshSupply()
    } else {
      await refreshDemand(pageSize.value, currentPage.value)
    }
  }
}

async function handlePageSizeChange() {
  if (viewResume.value) {
    await refreshSupply()
  } else {
    await refreshDemand(pageSize.value, currentPage.value)
  }
  totalPages.value = Math.max(1, Math.ceil(totalItems.value / pageSize.value))
}

async function viewResumeList(demandData: DemandItem, pageSize: number, currentPage: number, editingDemandData: boolean, order_by: string, demand_role_name_type: boolean, demand_role_name_data: string) {
  viewResume.value = true
  editingDemand.value = { ...demandData }
  role_list.value = ['前端工程师', '后端工程师', 'UI设计师']
  demand_role_name.value = role_list.value[0]

  // 模拟简历数据
  supplyList.value = [
    { id: 1, role: '前端工程师', specialty: 'Vue.js', citizenship: '中国', price: '500', japanese_level: 'N2', percent: 85 },
    { id: 2, role: '后端工程师', specialty: 'Node.js', citizenship: '日本', price: '600', japanese_level: 'Native', percent: 92 },
    { id: 3, role: 'UI设计师', specialty: 'Figma', citizenship: '韩国', price: '450', japanese_level: 'N3', percent: 78 }
  ]
}

async function viewSupplyList() {
  viewResume.value = false
  editingDemand.value = createDefaultDemand()
  await refreshDemand(pageSize.value, currentPage.value)
}

async function refreshSupply() {
  // 刷新简历列表
}

function handleCheckboxClickDemand(item: DemandItem) {
  item.active = !item.active
}

function selectRole(role: string) {
  demand_role_name.value = role
  refreshSupply()
}

function editSupply(supplyItem: SupplyItem) {
  editingSupply.value = { ...supplyItem }
}

async function supplyPreview(supplyItem: SupplyItem) {
  alert('预览简历功能')
}

async function deleteSupply(supply_id: number) {
  if (confirm('确定要删除这份简历吗？')) {
    supplyList.value = supplyList.value.filter(item => item.id !== supply_id)
  }
}

async function match() {
  matchLoading.value = true
  setTimeout(() => {
    matchLoading.value = false
    alert('匹配分析完成！')
  }, 2000)
}

function updateActive() {
  active.value = !active.value
  activeName.value = active.value ? '激活状态' : '全部状态'
  refreshDemand(pageSize.value, currentPage.value)
}

async function getMessages() {
  chatMessages.value = [
    { sender: '系统', text: '欢迎使用智能匹配系统！' },
    { sender: '用户', text: '请帮我分析当前的需求匹配情况' },
    { sender: '系统', text: '正在为您分析...', type: 'data', body: [] }
  ]
}

async function sendMessage() {
  if (newMessage.value.trim()) {
    sending.value = true
    chatMessages.value.push({ sender: '用户', text: newMessage.value })

    setTimeout(() => {
      chatMessages.value.push({ sender: '系统', text: '收到您的消息，正在处理中...' })
      sending.value = false
    }, 1000)

    newMessage.value = ''
  }
}

function showAddDemandModal() {
  alert('显示新增需求模态框')
}

function showUploadModal() {
  alert('显示上传简历模态框')
}

function chatDataOpen(body: any, download: boolean) {
  if (download) {
    alert('下载数据功能')
  } else {
    alert('查看数据功能')
  }
}

// 监听聊天消息变化，自动滚动到底部
watch(chatMessages, () => {
  nextTick(() => {
    const el = chatContainer.value
    if (el) el.scrollTop = el.scrollHeight
  })
}, { deep: true })
</script>

<style scoped>
.home-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.stat-icon.success {
  background: linear-gradient(135deg, var(--success-color), #059669);
}

.stat-icon.warning {
  background: linear-gradient(135deg, var(--warning-color), #d97706);
}

.stat-icon.info {
  background: linear-gradient(135deg, var(--accent-color), #0891b2);
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.stat-content p {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.875rem;
}

/* 主网格布局 */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  height: calc(100vh - 200px);
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 操作按钮组 */
.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.modern-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.modern-btn.primary {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: white;
}

.modern-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.modern-btn.secondary {
  background: var(--secondary-color);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.modern-btn.secondary:hover {
  background: var(--border-color);
}

.modern-btn.success {
  background: linear-gradient(135deg, var(--success-color), #059669);
  color: white;
}

.modern-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 内容卡片 */
.content-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-secondary);
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.modern-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
}

/* 角色筛选 */
.role-filter {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.role-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.role-btn:hover {
  background: var(--secondary-color);
  color: var(--text-primary);
}

.role-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* 表格样式 */
.table-container {
  flex: 1;
  overflow: auto;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.modern-table th {
  background: var(--bg-secondary);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 10;
}

.modern-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

.table-row {
  transition: background-color 0.3s ease;
}

.table-row:hover {
  background: var(--bg-secondary);
}

.demand-text {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background: #fef2f2;
  color: #991b1b;
}

/* 操作按钮 */
.action-buttons-small {
  display: flex;
  gap: 0.5rem;
}

.btn-small {
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.75rem;
}

.btn-small.primary {
  background: var(--primary-color);
  color: white;
}

.btn-small.secondary {
  background: var(--secondary-color);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-small.success {
  background: var(--success-color);
  color: white;
}

.btn-small.danger {
  background: var(--error-color);
  color: white;
}

.btn-small:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

/* 进度条 */
.progress-bar {
  position: relative;
  width: 100px;
  height: 20px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--success-color), var(--accent-color));
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-primary);
}

/* 分页样式 */
.pagination-container {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-secondary);
}

.pagination-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.pagination-controls {
  display: flex;
  gap: 0.5rem;
}

.pagination-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.pagination-btn:hover {
  background: var(--secondary-color);
}

.pagination-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 聊天面板样式 */
.chat-panel {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
  overflow: hidden;
}

.chat-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.chat-header i {
  font-size: 1.5rem;
}

.chat-messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  max-width: 80%;
  animation: fadeInUp 0.3s ease;
}

.message.user {
  align-self: flex-end;
}

.message.system {
  align-self: flex-start;
}

.message-content {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  line-height: 1.5;
  word-wrap: break-word;
}

.message.user .message-content {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: white;
  border-bottom-right-radius: 0.25rem;
}

.message.system .message-content {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-bottom-left-radius: 0.25rem;
}

.data-link, .download-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  margin-right: 1rem;
  transition: color 0.3s ease;
}

.data-link:hover, .download-link:hover {
  color: var(--primary-hover);
}

.chat-input {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  resize: none;
  min-height: 40px;
  max-height: 120px;
  transition: border-color 0.3s ease;
}

.message-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.send-btn {
  padding: 0.75rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 48px;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .chat-panel {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }

  .stat-content h3 {
    font-size: 1.5rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .modern-btn {
    justify-content: center;
  }

  .table-container {
    overflow-x: auto;
  }

  .modern-table {
    min-width: 600px;
  }

  .pagination-container {
    flex-direction: column;
    gap: 1rem;
  }
}

/* 加载动画 */
.fa-spin {
  animation: fa-spin 1s infinite linear;
}

@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
