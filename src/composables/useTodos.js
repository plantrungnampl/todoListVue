import { computed } from 'vue'
import { useTodoStore } from '@/stores/todos.js'
import { showToast, showConfirmDialog } from 'vant'


export function useTodos() {
  const store = useTodoStore()

  // Computed properties from store
  const todos = computed(() => store.filteredTodos)
  const totalCount = computed(() => store.totalCount)
  const activeCount = computed(() => store.activeCount)
  const completedCount = computed(() => store.completedCount)
  const hasCompleted = computed(() => store.hasCompleted)
  const allCompleted = computed(() => store.allCompleted)
  const currentFilter = computed(() => store.currentFilter)
  const isLoading = computed(() => store.isLoading)
  const error = computed(() => store.error)

  /**
   * Add new todo with UI feedback

   */
  async function addTodo(text) {
    const result = store.addTodo(text)

    if (result.success) {
      showToast({
        type: 'success',
        message: 'Todo đã được thêm',
        duration: 1500
      })
      return true
    } else {
      showToast({
        type: 'fail',
        message: result.errors.join(', '),
        duration: 3000
      })
      return false
    }
  }

  /**
   * Update todo with UI feedback

   */
  async function updateTodo(id, updates) {
    const result = store.updateTodo(id, updates)

    if (result.success) {
      showToast({
        type: 'success',
        message: 'Todo đã được cập nhật',
        duration: 1500
      })
      return true
    } else {
      showToast({
        type: 'fail',
        message: result.errors.join(', '),
        duration: 3000
      })
      return false
    }
  }

  /**
   * Delete todo with confirmation and UI feedback

   */
  async function deleteTodo(id, todo) {
    try {
      await showConfirmDialog({
        title: 'Xác nhận xóa',
        message: `Bạn có chắc muốn xóa todo "${todo.text}"?`,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#ee0a24'
      })

      const result = store.deleteTodo(id)

      if (result.success) {
        showToast({
          type: 'success',
          message: 'Todo đã được xóa',
          duration: 1500
        })
        return true
      } else {
        showToast({
          type: 'fail',
          message: result.errors.join(', '),
          duration: 3000
        })
        return false
      }
    } catch {
      // User cancelled
      return false
    }
  }

  /**
   * Toggle todo completion status

   */
  async function toggleTodo(id) {
    const result = store.toggleTodo(id)

    if (!result.success) {
      showToast({
        type: 'fail',
        message: result.errors.join(', '),
        duration: 3000
      })
      return false
    }

    return true
  }

  /**
   * Clear completed todos with confirmation
   */
  async function clearCompleted() {
    if (completedCount.value === 0) {
      showToast({
        type: 'fail',
        message: 'Không có todo nào đã hoàn thành',
        duration: 2000
      })
      return false
    }

    try {
      await showConfirmDialog({
        title: 'Xác nhận xóa',
        message: `Bạn có chắc muốn xóa ${completedCount.value} todo đã hoàn thành?`,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#ee0a24'
      })

      const result = store.clearCompleted()

      if (result.success) {
        showToast({
          type: 'success',
          message: `Đã xóa ${result.deletedCount} todo`,
          duration: 2000
        })
        return true
      } else {
        showToast({
          type: 'fail',
          message: result.errors.join(', '),
          duration: 3000
        })
        return false
      }
    } catch {
      // User cancelled
      return false
    }
  }

  /**
   * Toggle all todos completion status
   */
  async function toggleAllTodos() {
    const result = store.toggleAllTodos()

    if (result.success) {
      const message = result.allCompleted
        ? 'Đã đánh dấu tất cả todo hoàn thành'
        : 'Đã bỏ đánh dấu tất cả todo'

      showToast({
        type: 'success',
        message,
        duration: 1500
      })
      return true
    } else {
      showToast({
        type: 'fail',
        message: result.errors.join(', '),
        duration: 3000
      })
      return false
    }
  }

  /**
   * Set filter for todos
   */
  function setFilter(filter) {
    store.setFilter(filter)
  }

  /**
   * Clear all todos with confirmation
   */
  async function clearAllTodos() {
    if (totalCount.value === 0) {
      showToast({
        type: 'fail',
        message: 'Không có todo nào để xóa',
        duration: 2000
      })
      return false
    }

    try {
      await showConfirmDialog({
        title: 'Xác nhận xóa tất cả',
        message: `Bạn có chắc muốn xóa tất cả ${totalCount.value} todo?`,
        confirmButtonText: 'Xóa tất cả',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#ee0a24'
      })

      const result = store.clearAllTodos()

      if (result.success) {
        showToast({
          type: 'success',
          message: `Đã xóa tất cả ${result.deletedCount} todo`,
          duration: 2000
        })
        return true
      } else {
        showToast({
          type: 'fail',
          message: result.errors.join(', '),
          duration: 3000
        })
        return false
      }
    } catch {
      // User cancelled
      return false
    }
  }

  /**
   * Import todos with UI feedback

   */
  async function importTodos(todosData) {
    const result = store.importTodos(todosData)

    if (result.success) {
      let message = `Đã import ${result.importedCount} todo`
      if (result.skippedCount > 0) {
        message += `, bỏ qua ${result.skippedCount} todo không hợp lệ`
      }

      showToast({
        type: 'success',
        message,
        duration: 3000
      })
      return true
    } else {
      showToast({
        type: 'fail',
        message: result.errors.join(', '),
        duration: 3000
      })
      return false
    }
  }

  /**
   * Clear error state
   */
  function clearError() {
    store.clearError()
  }

  return {
    // Computed state
    todos,
    totalCount,
    activeCount,
    completedCount,
    hasCompleted,
    allCompleted,
    currentFilter,
    isLoading,
    error,

    // Actions
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
    toggleAllTodos,
    setFilter,
    clearAllTodos,
    importTodos,
    clearError
  }
}