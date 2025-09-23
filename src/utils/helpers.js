
/**
 * Generate unique ID

 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Format date for display

 */
export function formatDate(date) {
  if (!date || !(date instanceof Date)) {
    return ''
  }

  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

/**
 * Format relative time

 */
export function formatRelativeTime(date) {
  if (!date || !(date instanceof Date)) {
    return ''
  }

  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) {
    return 'Vừa xong'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} ngày trước`
  }

  return formatDate(date)
}

/**
 * Debounce function

 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Create todo object with default values

 */
export function createTodo(text, options = {}) {
  const now = new Date()
  return {
    id: generateId(),
    text: text.trim(),
    completed: false,
    createdAt: now,
    updatedAt: now,
    priority: 'medium',
    ...options
  }
}

/**
 * Export todos to JSON

 */
export function exportTodos(todos) {
  const exportData = {
    todos,
    exportedAt: new Date().toISOString(),
    version: '1.0.0'
  }
  return JSON.stringify(exportData, null, 2)
}

/**
 * Parse imported todos

 */
export function importTodos(jsonString) {
  try {
    const data = JSON.parse(jsonString)

    if (!data.todos || !Array.isArray(data.todos)) {
      throw new Error('Invalid format: todos array not found')
    }

    // Validate and sanitize each todo
    const validTodos = data.todos
      .filter(todo => todo && typeof todo === 'object')
      .map(todo => ({
        ...todo,
        id: todo.id || generateId(),
        createdAt: todo.createdAt ? new Date(todo.createdAt) : new Date(),
        updatedAt: todo.updatedAt ? new Date(todo.updatedAt) : new Date()
      }))

    return {
      success: true,
      todos: validTodos,
      importedAt: new Date(),
      originalVersion: data.version || 'unknown'
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      todos: []
    }
  }
}