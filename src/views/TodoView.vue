<template>
  <div class="todo-view">
    <!-- Header -->
    <div class="todo-header">
      <h1 class="todo-title">
        <van-icon name="todo-list-o" />
        Todo App
      </h1>
    </div>


    <!-- Input section -->
    <TodoInput
      ref="todoInputRef"
      :disabled="isLoading"
      @submita="handleAddTodo"
      
    />
    <!-- Search Input -->
    <div class="search-container">
      <van-field
        placeholder="Tìm kiếm todos..."
        clearable
        @input="handleSearchTodos"
        @clear="handleSearchTodos('')"
      >
        <template #left-icon>
          <van-icon name="search" />
        </template>
      </van-field>
    </div>

      <!-- Filters and Stats -->
      <TodoFilters
      :current-filter="currentFilter"
      :total-count="totalCount"
      :active-count="activeCount"
      :completed-count="completedCount"
      :show-stats="true"
      :show-counts="true"
      @filter-change="handleFilterChange"
    />

    <!-- Actions -->
    <TodoActions
      :total-count="totalCount"
      :has-completed="hasCompleted"
      :all-completed="allCompleted"
      :todos="todosForExport"
      :is-loading="isLoading"
      @toggle-all="handleToggleAll"
      @clear-completed="handleClearCompleted"
      @clear-all="handleClearAll"
      @import-todos="handleImportTodos"
    />

    <!-- Loading state -->
    <van-loading
      v-if="isLoading && todos.length === 0"
      class="main-loading"
      vertical
    >
      Đang tải...
    </van-loading>

    <!-- Todo list -->
    <div v-else class="todo-list">
      <!-- Empty state -->
      <div v-if="todos.length === 0" class="empty-state">
        <van-empty
          :image="emptyStateImage"
          :description="emptyStateDescription"
        >
          <van-button
            type="primary"
            size="small"
            @click="focusInput"
          >
            {{ emptyStateAction }}
          </van-button>
        </van-empty>
      </div>

      <!-- Todo items -->
      <transition-group
        v-else
        name="todo-list"
        tag="div"
        class="todo-items"
      >
        <TodoItem
          v-for="todo in todos"
          :key="todo.id"
          :todo="todo"
          :disabled="isLoading"
          @toggle="handleToggleTodo"
          @update="handleUpdateTodo"
          @delete="handleDeleteTodo"
          @edit-start="handleEditStart"
          @edit-end="handleEditEnd"
        />
      </transition-group>
    </div>

    <!-- Error handling -->
    <van-toast v-if="error" type="fail" :message="error" />

    <!-- Floating action button for mobile -->
    <van-floating-bubble
      v-if="isMobile"
      axis="xy"
      icon="plus"
      :style="{ right: '20px', bottom: '20px' }"
      @click="focusInput"
    />
  </div>
  <div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useTodos } from '@/composables/useTodos.js'
import { TODO_FILTERS } from '@/types/todo.js'
import TodoInput from '@/components/TodoInput.vue'
import TodoItem from '@/components/TodoItem.vue'
import TodoFilters from '@/components/TodoFilters.vue'
import TodoActions from '@/components/TodoActions.vue'
// Composables
const {
  todos,
  totalCount,
  activeCount,
  completedCount,
  hasCompleted,
  allCompleted,
  currentFilter,
  searchQuery,
  isLoading,
  error,
  addTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
  clearCompleted,
  toggleAllTodos,
  setFilter,
  clearAllTodos,
  importTodos,
  clearError,
  searchTodos,
} = useTodos()

// Refs state
const todoInputRef = ref(null)
const editingTodoId = ref(null)

// Computed
const isMobile = computed(() => {
  return window.innerWidth <= 768
})

const emptyStateImage = computed(() => {
  switch (currentFilter.value) {
    case TODO_FILTERS.ACTIVE:
      return 'success'
    case TODO_FILTERS.COMPLETED:
      return 'error'
    default:
      return 'default'
  }
})

const emptyStateDescription = computed(() => {
  switch (currentFilter.value) {
    case TODO_FILTERS.ACTIVE:
      return totalCount.value > 0
        ? 'Tất cả todo đã hoàn thành'
        : 'Chưa có todo nào được tạo'
    case TODO_FILTERS.COMPLETED:
      return 'Chưa có todo nào được hoàn thành'
    default:
      return 'Danh sách todo trống. Hãy thêm todo đầu tiên!'
  }
})

const emptyStateAction = computed(() => {
  return currentFilter.value === TODO_FILTERS.ACTIVE && totalCount.value > 0
    ? 'Thêm todo mới'
    : 'Thêm todo'
})

const todosForExport = computed(() => {
  return todos.value
})

async function handleAddTodo(text) {
  const success = await addTodo(text)
  if (success) {
    if (currentFilter.value === TODO_FILTERS.COMPLETED) {
      setFilter(TODO_FILTERS.ALL)
    }
  }
}

async function handleUpdateTodo(id, updates) {
  await updateTodo(id, updates)
}

async function handleDeleteTodo(id, todo) {
  await deleteTodo(id, todo)
}

async function handleToggleTodo(id) {
  await toggleTodo(id)
}

async function handleClearCompleted() {
  await clearCompleted()
}

async function handleToggleAll() {
  await toggleAllTodos()
}

async function handleClearAll() {
  await clearAllTodos()
}
function handleSearchTodos(query) {
  searchTodos(query)
}
async function handleImportTodos(importedTodos) {
  await importTodos(importedTodos)
}

function handleFilterChange(filter) {
  setFilter(filter)
}

function handleEditStart(todoId) {
  editingTodoId.value = todoId
}

function handleEditEnd(todoId) {
  if (editingTodoId.value === todoId) {
    editingTodoId.value = null
  }
}

function focusInput() {
  nextTick(() => {
    if (todoInputRef.value?.focus) {
      todoInputRef.value.focus()
    }
  })
}

onMounted(() => {
  clearError()
  setTimeout(() => {
    focusInput()
  }, 100)
})

defineExpose({
  focusInput,
  addTodo: handleAddTodo,
  getTodoCount: () => totalCount.value,
  getCurrentFilter: () => currentFilter.value
})
</script>

<style scoped>
.todo-view {
  max-width: 900px;
  margin: 0 auto;
  background-color: #fff;
  min-height: 100vh;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.todo-header {
  padding: 24px 16px 16px;
  text-align: center;
  background: linear-gradient(135deg, #1989fa 0%, #07c160 100%);
  color: white;
}

.todo-title {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.todo-title .van-icon {
  font-size: 32px;
}

.search-container {
  padding: 0 16px 16px 16px;
  background-color: #fff;
  border-bottom: 1px solid #ebedf0;
}

.search-container .van-field {
  background-color: #f7f8fa;
  border-radius: 8px;
  padding: 8px 12px;
}

.main-loading {
  padding: 40px;
  text-align: center;
}

.todo-list {
  flex: 1;
  overflow-y: auto;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.todo-items {
  background-color: #fff;
}

/* Transitions */
.todo-list-enter-active,
.todo-list-leave-active {
  transition: all 0.3s ease;
}

.todo-list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.todo-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.todo-list-move {
  transition: transform 0.3s ease;
}

/* Responsive design */
@media (max-width: 768px) {
  .todo-view {
    max-width: 100%;
    box-shadow: none;
  }

  .todo-header {
    padding: 20px 16px 12px;
  }

  .todo-title {
    font-size: 24px;
  }

  .todo-title .van-icon {
    font-size: 28px;
  }

  .empty-state {
    padding: 32px 16px;
  }
}

@media (max-width: 480px) {
  .todo-header {
    padding: 16px 12px 8px;
  }

  .todo-title {
    font-size: 20px;
  }

  .todo-title .van-icon {
    font-size: 24px;
  }
}

/* Scrollbar styling */
.todo-list::-webkit-scrollbar {
  width: 6px;
}

.todo-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.todo-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.todo-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Loading overlay */
.todo-view.loading {
  pointer-events: none;
}

.todo-view.loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 1000;
}

/* Accessibility */
.todo-view:focus-within {
  outline: none;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .todo-view {
    background-color: #1a1a1a;
    color: #fff;
  }

  .todo-header {
    background: linear-gradient(135deg, #0066cc 0%, #059652 100%);
  }

  .todo-items {
    background-color: #1a1a1a;
  }

  .todo-list::-webkit-scrollbar-track {
    background: #333;
  }

  .todo-list::-webkit-scrollbar-thumb {
    background: #666;
  }

  .todo-list::-webkit-scrollbar-thumb:hover {
    background: #777;
  }
}

/* Print styles */
@media print {
  .todo-view {
    box-shadow: none;
    max-width: 100%;
  }

  .todo-header {
    background: #000 !important;
    -webkit-print-color-adjust: exact;
  }

  .van-floating-bubble {
    display: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .todo-view {
    border: 2px solid #000;
  }

  .todo-header {
    border-bottom: 2px solid #000;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .todo-list-enter-active,
  .todo-list-leave-active,
  .todo-list-move {
    transition: none;
  }

  .van-floating-bubble {
    transition: none;
  }
}
</style>