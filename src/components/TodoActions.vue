<template>
  <div class="todo-actions">
    <div class="action-row">
      <!-- Toggle all todos -->
      <van-button
        v-if="totalCount > 0"
        type="default"
        size="small"
        :icon="allCompleted ? 'success' : 'circle'"
        :disabled="isLoading"
        @click="handleToggleAll"
      >
        {{ allCompleted ? 'Bỏ chọn tất cả' : 'Chọn tất cả' }}
      </van-button>

      <div class="action-buttons">
        <!-- Clear completed -->
        <van-button
          v-if="hasCompleted"
          type="warning"
          size="small"
          icon="delete-o"
          :disabled="isLoading"
          @click="handleClearCompleted"
        >
          Xóa hoàn thành
        </van-button>

        <!-- Export/Import -->
        <van-button
          v-if="totalCount > 0"
          type="default"
          size="small"
          icon="down"
          :disabled="isLoading"
          @click="handleExport"
        >
          Xuất
        </van-button>

        <van-button
          type="default"
          size="small"
          icon="plus"
          :disabled="isLoading"
          @click="triggerImport"
        >
          Nhập
        </van-button>

        <!-- Clear all (danger action) -->
        <van-button
          v-if="totalCount > 0"
          type="danger"
          size="small"
          icon="clear"
          :disabled="isLoading"
          @click="handleClearAll"
        >
          Xóa tất cả
        </van-button>
      </div>
    </div>

    <!-- Hidden file input for import -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleImport"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { exportTodos, importTodos } from '@/utils/helpers.js'
import { showToast } from 'vant'

// Props
const props = defineProps({
  totalCount: {
    type: Number,
    default: 0
  },
  hasCompleted: {
    type: Boolean,
    default: false
  },
  allCompleted: {
    type: Boolean,
    default: false
  },
  todos: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'toggle-all',
  'clear-completed',
  'clear-all',
  'import-todos'
])
// Refs
const fileInput = ref(null)

// Methods
function handleToggleAll() {
  try {
    emit('toggle-all')
  } catch (error) {
    console.error('Error toggling all todos:', error)
  }
}

function handleClearCompleted() {
  try {
    emit('clear-completed')
  } catch (error) {
    console.error('Error clearing completed todos:', error)
  }
}

function handleClearAll() {
  try {
    emit('clear-all')
  } catch (error) {
    console.error('Error clearing all todos:', error)
  }
}

function handleExport() {
  try {
    if (props.todos.length === 0) {
      showToast({
        type: 'fail',
        message: 'Không có todo nào để xuất',
        duration: 2000
      })
      return
    }

    const exportData = exportTodos(props.todos)
    const blob = new Blob([exportData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    // Create download link
    const link = document.createElement('a')
    link.href = url
    link.download = `todos-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up
    URL.revokeObjectURL(url)

    showToast({
      type: 'success',
      message: 'Đã xuất danh sách todo',
      duration: 2000
    })
  } catch (error) {
    console.error('Error exporting todos:', error)
    showToast({
      type: 'fail',
      message: 'Có lỗi xảy ra khi xuất file',
      duration: 3000
    })
  }
}

function triggerImport() {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

async function handleImport(event) {
  const file = event.target.files?.[0]

  if (!file) {
    return
  }

  // Reset file input
  event.target.value = ''

  if (!file.name.endsWith('.json')) {
    showToast({
      type: 'fail',
      message: 'Vui lòng chọn file JSON',
      duration: 3000
    })
    return
  }

  try {
    const fileContent = await readFileAsText(file)
    const importResult = importTodos(fileContent)

    if (importResult.success) {
      emit('import-todos', importResult.todos)
    } else {
      showToast({
        type: 'fail',
        message: `Lỗi import: ${importResult.error}`,
        duration: 3000
      })
    }
  } catch (error) {
    console.error('Error importing todos:', error)
    showToast({
      type: 'fail',
      message: 'Có lỗi xảy ra khi đọc file',
      duration: 3000
    })
  }
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      resolve(event.target?.result)
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}
</script>

<style scoped>
.todo-actions {
  padding: 16px;
  background-color: #f7f8fa;
  border-bottom: 1px solid #ebedf0;
}

.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.van-button--small {
  font-size: 12px;
  padding: 0 8px;
  height: 28px;
  border-radius: 14px;
}

/* Button type specific styles */
.van-button--danger {
  background-color: #ee0a24;
  border-color: #ee0a24;
}

.van-button--warning {
  background-color: #ff976a;
  border-color: #ff976a;
  color: #fff;
}

.van-button--default {
  background-color: #fff;
  border-color: #ebedf0;
  color: #323233;
}

.van-button--default:hover {
  background-color: #f2f3f5;
}

/* Responsive design */
@media (max-width: 768px) {
  .todo-actions {
    padding: 12px 16px;
  }

  .action-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .action-buttons {
    justify-content: center;
    flex-wrap: wrap;
  }

  .van-button--small {
    flex: 1;
    min-width: 80px;
    max-width: 120px;
  }
}

@media (max-width: 480px) {
  .action-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .van-button--small {
    max-width: none;
  }
}

/* Loading state */
.todo-actions.loading {
  opacity: 0.6;
  pointer-events: none;
}

/* Animation */
.van-button {
  transition: all 0.3s ease;
}

.van-button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.van-button:not(:disabled):active {
  transform: translateY(0);
}

/* Empty state */
.todo-actions.empty .action-buttons > .van-button:not(:last-child) {
  display: none;
}

/* Accessibility */
.van-button:focus-visible {
  outline: 2px solid #1989fa;
  outline-offset: 2px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .todo-actions {
    background-color: #2a2a2a;
    border-color: #333;
  }

  .van-button--default {
    background-color: #333;
    border-color: #555;
    color: #fff;
  }

  .van-button--default:hover {
    background-color: #444;
  }
}
</style>