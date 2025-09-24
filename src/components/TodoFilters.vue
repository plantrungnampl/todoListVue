<template>
  <div class="todo-filters">
    <van-tabs
      v-model:active="activeTab"
      :line-width="40"
      :line-height="3"
      color="#1989fa"
      title-active-color="#1989fa"
      title-inactive-color="#646566"
      @change="handleTabChange"
    >
      <van-tab
        v-for="filter in filters"
        :key="filter.value"
        :title="getTabTitle(filter)"
        :name="filter.value"
      />
    </van-tabs>

    <!-- Stats section -->
    <div v-if="showStats" class="todo-stats">
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-number">{{ totalCount }}</span>
          <span class="stat-label">Tổng</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ activeCount }}</span>
          <span class="stat-label">Còn lại</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ completedCount }}</span>
          <span class="stat-label">Hoàn thành</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ completionPercentage }}%</span>
          <span class="stat-label">Tiến độ</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { TODO_FILTERS } from '@/types/todo.js'

// Props
const props = defineProps({
  currentFilter: {
    type: String,
    default: TODO_FILTERS.ALL,
    validator: (value) => Object.values(TODO_FILTERS).includes(value)
  },
  totalCount: {
    type: Number,
    default: 0
  },
  activeCount: {
    type: Number,
    default: 0
  },
  completedCount: {
    type: Number,
    default: 0
  },
  showStats: {
    type: Boolean,
    default: true
  },
  showCounts: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['filter-change'])

// State
const activeTab = ref(props.currentFilter)

// Computed
const filters = computed(() => [
  {
    value: TODO_FILTERS.ALL,
    label: 'Tất cả',
    count: props.totalCount
  },
  {
    value: TODO_FILTERS.ACTIVE,
    label: 'Còn lại',
    count: props.activeCount
  },
  {
    value: TODO_FILTERS.COMPLETED,
    label: 'Hoàn thành',
    count: props.completedCount
  }
])

const completionPercentage = computed(() => {
  if (props.totalCount === 0) return 0
  return Math.round((props.completedCount / props.totalCount) * 100)
})


watch(() => props.currentFilter, (newFilter) => {
  activeTab.value = newFilter
})

// Methods
function getTabTitle(filter) {
  let title = filter.label

  if (props.showCounts && filter.count !== undefined) {
    title += ` (${filter.count})`
  }

  return title
}

function handleTabChange(tabName) {
  if (tabName !== props.currentFilter) {
    emit('filter-change', tabName)
  }
}

// Expose methods to parent
defineExpose({
  setFilter: (filter) => {
    activeTab.value = filter
  }
})
</script>

<style scoped>
.todo-filters {
  background-color: #fff;
  border-bottom: 1px solid #ebedf0;
}

.van-tabs {
  --van-tabs-bottom-bar-color: #1989fa;
}

.van-tabs :deep(.van-tab) {
  flex: 1;
  font-weight: 500;
}

.van-tabs :deep(.van-tab__text) {
  font-size: 14px;
}

.van-tabs :deep(.van-tabs__nav) {
  padding: 0 16px;
}

.van-tabs :deep(.van-tabs__line) {
  border-radius: 2px;
}

.todo-stats {
  padding: 16px;
  background-color: #f7f8fa;
  border-bottom: 1px solid #ebedf0;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 60px;
}

.stat-number {
  font-size: 20px;
  font-weight: 600;
  color: #323233;
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: #969799;
  margin-top: 2px;
}

/* Responsive design */
@media (max-width: 768px) {
  .van-tabs :deep(.van-tab__text) {
    font-size: 13px;
  }

  .todo-stats {
    padding: 12px 16px;
  }

  .stat-number {
    font-size: 18px;
  }

  .stat-label {
    font-size: 11px;
  }

  .stat-item {
    min-width: 50px;
  }
}

/* Animation for stats */
.stat-number {
  transition: all 0.3s ease;
}

.stat-item:hover .stat-number {
  transform: scale(1.1);
  color: #1989fa;
}

/* Progress indicator styles */
.stat-item:last-child .stat-number {
  background: linear-gradient(135deg, #1989fa 0%, #07c160 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Active tab style enhancement */
.van-tabs :deep(.van-tab--active .van-tab__text) {
  font-weight: 600;
}

/* Loading state */
.todo-filters.loading {
  opacity: 0.6;
  pointer-events: none;
}

/* Empty state */
.todo-filters.empty .stat-number {
  color: #c8c9cc;
}

/* Success state for completed todos */
.stat-item:nth-child(3) .stat-number {
  color: #07c160;
}

/* Warning state for active todos */
.stat-item:nth-child(2) .stat-number {
  color: #ff976a;
}

/* Accessibility */
.van-tabs :deep(.van-tab:focus-visible) {
  outline: 2px solid #1989fa;
  outline-offset: -2px;
  border-radius: 4px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .todo-filters {
    background-color: #1a1a1a;
    border-color: #333;
  }

  .todo-stats {
    background-color: #2a2a2a;
    border-color: #333;
  }

  .stat-number {
    color: #fff;
  }

  .stat-label {
    color: #888;
  }
}
</style>