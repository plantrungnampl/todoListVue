
/**
 * Validate todo text
 */
export function validateTodoText(text) {
  const errors = []

  if (!text || typeof text !== 'string') {
    errors.push('Todo text is required')
  } else {
    const trimmedText = text.trim()

    if (trimmedText.length === 0) {
      errors.push('Todo text cannot be empty')
    }

    if (trimmedText.length > 500) {
      errors.push('Todo text must be less than 500 characters')
    }

    if (trimmedText.length < 2) {
      errors.push('Todo text must be at least 2 characters')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedText: text?.trim() || ''
  }
}

/**
 * Validate todo ID

 */
export function validateTodoId(id) {
  return typeof id === 'string' && id.length > 0
}

/**
 * Sanitize and validate todo data

 */
export function validateTodoData(todoData) {
  const errors = []
  const sanitized = {}

  // Validate text
  if (todoData.text !== undefined) {
    const textValidation = validateTodoText(todoData.text)
    if (!textValidation.isValid) {
      errors.push(...textValidation.errors)
    } else {
      sanitized.text = textValidation.sanitizedText
    }
  }

  if (todoData.completed !== undefined) {
    if (typeof todoData.completed === 'boolean') {
      sanitized.completed = todoData.completed
    } else {
      errors.push('Completed status must be a boolean')
    }
  }

  if (todoData.createdAt !== undefined) {
    const createdAt = new Date(todoData.createdAt)
    if (isNaN(createdAt.getTime())) {
      errors.push('Invalid creation date')
    } else {
      sanitized.createdAt = createdAt
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: sanitized
  }
}