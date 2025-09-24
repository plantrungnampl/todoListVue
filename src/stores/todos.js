import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { TODO_FILTERS } from '@/types/todo.js'
import { StorageService } from '@/utils/storage.js'
import { validateTodoText, validateTodoId } from '@/utils/validation.js'
import { createTodo, debounce } from '@/utils/helpers.js'


export const useTodoStore = defineStore('todos', () => {
  // State
  const todos = ref([])
  const currentFilter = ref(TODO_FILTERS.ALL)
  const searchQuery = ref('')
  const isLoading = ref(false)
  const error = ref(null)

  const debouncedSave = debounce(() => {
    StorageService.saveTodos(todos.value)
  }, 300)
   
  // Computed
  const filteredTodos = computed(() => {
    let filtered = todos.value
    if (searchQuery.value.data?.trim()) {

      const query = searchQuery.value.data.toLowerCase()?.trim()
      
      filtered = filtered.filter(todo =>
        todo.text.toLowerCase().includes(query)
      )
    }

    switch (currentFilter.value) {
      case TODO_FILTERS.ACTIVE:
        return filtered.filter(todo => !todo.completed)
      case TODO_FILTERS.COMPLETED:
        return filtered.filter(todo => todo.completed)
      default:
        return filtered
    }
  })

  const totalCount = computed(() => todos.value.length)
  const activeCount = computed(() => todos.value.filter(todo => !todo.completed).length)
  const completedCount = computed(() => todos.value.filter(todo => todo.completed).length)
  const hasCompleted = computed(() => completedCount.value > 0)
  const allCompleted = computed(() => totalCount.value > 0 && activeCount.value === 0)

  // Actions
  /**
   * Load todos from localStorage
   */
  async function loadTodos() {
    try {
      isLoading.value = true
      error.value = null

      const savedTodos = StorageService.loadTodos()

      todos.value = savedTodos
        .filter(todo => todo && typeof todo === 'object')
        .map(todo => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt)
        }))
        .sort((a, b) => b.createdAt - a.createdAt)

    } catch (err) {
      error.value = 'Failed to load todos'
      console.error('Error loading todos:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Add new todo

   */
  function addTodo(text) {
    const validation = validateTodoText(text)

    if (!validation.isValid) {
      error.value = validation.errors.join(', ')
      return { success: false, errors: validation.errors }
    }

    try {
      const newTodo = createTodo(validation.sanitizedText)
      todos.value.unshift(newTodo)
      debouncedSave()
      error.value = null

      return { success: true, todo: newTodo }
    } catch (err) {
      error.value = 'Failed to add todo'
      console.error('Error adding todo:', err)
      return { success: false, errors: ['Failed to add todo'] }
    }
  }

  /**
   * Update todo

   */
  function updateTodo(id, updates) {
    if (!validateTodoId(id)) {
      error.value = 'Invalid todo ID'
      return { success: false, errors: ['Invalid todo ID'] }
    }

    const todoIndex = todos.value.findIndex(todo => todo.id === id)

    if (todoIndex === -1) {
      error.value = 'Todo not found'
      return { success: false, errors: ['Todo not found'] }
    }

    try {
      const currentTodo = todos.value[todoIndex]
      const updatedTodo = {
        ...currentTodo,
        ...updates,
        updatedAt: new Date()
      }

      // Validate text if being updated
      if (updates.text !== undefined) {
        const validation = validateTodoText(updates.text)
        if (!validation.isValid) {
          error.value = validation.errors.join(', ')
          return { success: false, errors: validation.errors }
        }
        updatedTodo.text = validation.sanitizedText
      }

      todos.value[todoIndex] = updatedTodo
      debouncedSave()
      error.value = null

      return { success: true, todo: updatedTodo }
    } catch (err) {
      error.value = 'Failed to update todo'
      console.error('Error updating todo:', err)
      return { success: false, errors: ['Failed to update todo'] }
    }
  }

  /**
   * Delete todo

   */
  function deleteTodo(id) {
    if (!validateTodoId(id)) {
      error.value = 'Invalid todo ID'
      return { success: false, errors: ['Invalid todo ID'] }
    }

    const todoIndex = todos.value.findIndex(todo => todo.id === id)

    if (todoIndex === -1) {
      error.value = 'Todo not found'
      return { success: false, errors: ['Todo not found'] }
    }

    try {
      const deletedTodo = todos.value[todoIndex]
      todos.value.splice(todoIndex, 1)
      debouncedSave()
      error.value = null

      return { success: true, todo: deletedTodo }
    } catch (err) {
      error.value = 'Failed to delete todo'
      console.error('Error deleting todo:', err)
      return { success: false, errors: ['Failed to delete todo'] }
    }
  }

  /**
   * Toggle todo completion status

   */
  function toggleTodo(id) {
    const todo = todos.value.find(t => t.id === id)
    if (!todo) {
      return { success: false, errors: ['Todo not found'] }
    }

    return updateTodo(id, { completed: !todo.completed })
  }


  /**
   * Search todos by text
   */
  function searchTodos(query) {
    searchQuery.value = query || ''
    error.value = null
    return { success: true, query: searchQuery.value }
  }

 


  /**
   * Clear all completed todos

   */
  function clearCompleted() {
    try {
      const completedTodos = todos.value.filter(todo => todo.completed)
      todos.value = todos.value.filter(todo => !todo.completed)
      debouncedSave()
      error.value = null

      return { success: true, deletedCount: completedTodos.length }
    } catch (err) {
      error.value = 'Failed to clear completed todos'
      console.error('Error clearing completed todos:', err)
      return { success: false, errors: ['Failed to clear completed todos'] }
    }
  }

  /**
   * Toggle all todos
   */
  function toggleAllTodos() {
    try {
      const shouldComplete = !allCompleted.value
      const now = new Date()

      todos.value.forEach(todo => {
        todo.completed = shouldComplete
        todo.updatedAt = now
      })

      debouncedSave()
      error.value = null

      return { success: true, allCompleted: shouldComplete }
    } catch (err) {
      error.value = 'Failed to toggle all todos'
      console.error('Error toggling all todos:', err)
      return { success: false, errors: ['Failed to toggle all todos'] }
    }
  }

  /**
   * Set current filter
   */
  function setFilter(filter) {
    if (Object.values(TODO_FILTERS).includes(filter)) {
      currentFilter.value = filter
      error.value = null
    }
  }

  /**
   * Clear all todos
   */
  function clearAllTodos() {
    try {
      const totalDeleted = todos.value.length
      todos.value = []
      debouncedSave()
      error.value = null

      return { success: true, deletedCount: totalDeleted }
    } catch (err) {
      error.value = 'Failed to clear all todos'
      console.error('Error clearing all todos:', err)
      return { success: false, errors: ['Failed to clear all todos'] }
    }
  }

  /**
   * Import todos from external data

   */
  function importTodos(importedTodos) {
    if (!Array.isArray(importedTodos)) {
      error.value = 'Invalid import data'
      return { success: false, errors: ['Invalid import data'] }
    }

    try {
      const validTodos = importedTodos.filter(todo => {
        const validation = validateTodoText(todo.text)
        return validation.isValid
      })

      todos.value = [...validTodos, ...todos.value]
      debouncedSave()
      error.value = null

      return {
        success: true,
        importedCount: validTodos.length,
        skippedCount: importedTodos.length - validTodos.length
      }
    } catch (err) {
      error.value = 'Failed to import todos'
      console.error('Error importing todos:', err)
      return { success: false, errors: ['Failed to import todos'] }
    }
  }

  /**
   * Clear error state
   */
  function clearError() {
    error.value = null
  }

  // Initialize store
  loadTodos()

  return {
    // State
    todos: readonly(todos),
    currentFilter: readonly(currentFilter),
    searchQuery: readonly(searchQuery),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Computed
    filteredTodos,
    totalCount,
    activeCount,
    completedCount,
    hasCompleted,
    allCompleted,

    // Actions
    loadTodos,
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
    searchTodos
  }
})