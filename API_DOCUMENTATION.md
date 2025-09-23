# Vue TodoList - API Documentation

## 📋 Stores API Reference

### useTodoStore (Pinia Store)

Store chính quản lý state và business logic của TodoList.

#### State

```javascript
const store = useTodoStore()

// Reactive state
store.todos          // Todo[] - Danh sách todos
store.currentFilter  // string - Filter hiện tại
store.isLoading     // boolean - Trạng thái loading
store.error         // string|null - Error message

// Computed state
store.filteredTodos  // Todo[] - Todos đã filter
store.totalCount    // number - Tổng số todos
store.activeCount   // number - Số todos chưa hoàn thành
store.completedCount // number - Số todos đã hoàn thành
store.hasCompleted  // boolean - Có todos hoàn thành không
store.allCompleted  // boolean - Tất cả todos đã hoàn thành
```

#### Actions

##### loadTodos()
```javascript
async function loadTodos(): Promise<void>
```
- **Mục đích**: Load todos từ localStorage
- **Side effects**: Cập nhật `todos`, `isLoading`, `error`
- **Error handling**: Fallback to empty array

##### addTodo(text)
```javascript
function addTodo(text: string): ActionResult
```
- **Input**: `text` - Nội dung todo (string, required)
- **Validation**:
  - Text không empty
  - Length 2-500 characters
  - Type string
- **Returns**:
```javascript
{
  success: boolean,
  todo?: Todo,
  errors?: string[]
}
```

##### updateTodo(id, updates)
```javascript
function updateTodo(id: string, updates: Partial<Todo>): ActionResult
```
- **Input**:
  - `id` - Todo ID (string, required)
  - `updates` - Object với fields cần update
- **Validation**: ID tồn tại, updates hợp lệ
- **Returns**: ActionResult với updated todo

##### deleteTodo(id)
```javascript
function deleteTodo(id: string): ActionResult
```
- **Input**: `id` - Todo ID (string, required)
- **Returns**: ActionResult với deleted todo

##### toggleTodo(id)
```javascript
function toggleTodo(id: string): ActionResult
```
- **Input**: `id` - Todo ID (string, required)
- **Logic**: Toggle completed status
- **Returns**: ActionResult

##### clearCompleted()
```javascript
function clearCompleted(): ActionResult
```
- **Logic**: Xóa tất cả todos đã hoàn thành
- **Returns**: ActionResult với deletedCount

##### toggleAllTodos()
```javascript
function toggleAllTodos(): ActionResult
```
- **Logic**: Toggle tất cả todos (complete/incomplete)
- **Returns**: ActionResult với allCompleted status

## 🔧 Composables API Reference

### useTodos()

Composable cung cấp interface clean cho components, bao gồm UI feedback.

#### Usage
```javascript
import { useTodos } from '@/composables/useTodos.js'

const {
  // State
  todos, totalCount, activeCount, completedCount,
  hasCompleted, allCompleted, currentFilter, isLoading, error,

  // Actions
  addTodo, updateTodo, deleteTodo, toggleTodo,
  clearCompleted, toggleAllTodos, setFilter,
  clearAllTodos, importTodos, clearError
} = useTodos()
```

#### Enhanced Actions (với UI feedback)

##### addTodo(text)
```javascript
async function addTodo(text: string): Promise<boolean>
```
- **Input**: Text content
- **UI Feedback**: Success/error toast
- **Returns**: Success status
- **Auto-behavior**: Switch to 'all' filter sau khi add

##### deleteTodo(id, todo)
```javascript
async function deleteTodo(id: string, todo: Todo): Promise<boolean>
```
- **Input**: ID và todo object (cho confirmation message)
- **UI Feedback**: Confirmation dialog + success/error toast
- **Returns**: Success status

##### clearCompleted()
```javascript
async function clearCompleted(): Promise<boolean>
```
- **UI Feedback**:
  - Confirmation dialog với count
  - Success toast với số lượng deleted
- **Validation**: Check có completed todos không

## 🧰 Utilities API Reference

### StorageService

Class utility cho localStorage operations.

```javascript
import { StorageService } from '@/utils/storage.js'

// Generic methods
StorageService.save(key: string, data: any): boolean
StorageService.load(key: string, defaultValue?: any): any
StorageService.remove(key: string): boolean

// Todo-specific methods
StorageService.saveTodos(todos: Todo[]): boolean
StorageService.loadTodos(): Todo[]
```

### Validation Utilities

```javascript
import {
  validateTodoText,
  validateTodoId,
  validateTodoData
} from '@/utils/validation.js'

// Text validation
validateTodoText(text: string): ValidationResult
// Returns: { isValid: boolean, errors: string[], sanitizedText: string }

// ID validation
validateTodoId(id: string): boolean

// Data validation
validateTodoData(data: object): ValidationResult
// Returns: { isValid: boolean, errors: string[], sanitizedData: object }
```

### Helper Utilities

```javascript
import {
  generateId,
  formatDate,
  formatRelativeTime,
  debounce,
  createTodo,
  exportTodos,
  importTodos
} from '@/utils/helpers.js'

// ID generation
generateId(): string

// Date formatting
formatDate(date: Date): string // "23/09/2025, 14:30"
formatRelativeTime(date: Date): string // "2 giờ trước"

// Function utilities
debounce(func: Function, wait: number): Function

// Todo utilities
createTodo(text: string, options?: object): Todo
exportTodos(todos: Todo[]): string // JSON string
importTodos(jsonString: string): ImportResult
```

## 📝 Type Definitions

### Todo Interface
```javascript
/**
 * @typedef {Object} Todo
 * @property {string} id - Unique identifier
 * @property {string} text - Todo description (2-500 chars)
 * @property {boolean} completed - Completion status
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 * @property {string} priority - Priority level (low|medium|high)
 */
```

### ActionResult Interface
```javascript
/**
 * @typedef {Object} ActionResult
 * @property {boolean} success - Operation success status
 * @property {any} [data] - Result data (todo, count, etc.)
 * @property {string[]} [errors] - Error messages
 * @property {string} [message] - User-friendly message
 */
```

### ValidationResult Interface
```javascript
/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Validation success
 * @property {string[]} errors - Validation error messages
 * @property {string} sanitizedText - Cleaned input text
 */
```

## 🎨 Component Props & Events

### TodoItem Component

#### Props
```javascript
const props = {
  todo: {
    type: Object,       // Todo object
    required: true,
    validator: (todo) => /* validation logic */
  },
  disabled: {
    type: Boolean,
    default: false
  }
}
```

#### Events
```javascript
// Emitted events
emit('toggle', todoId)              // Toggle completion
emit('update', todoId, updates)     // Update todo
emit('delete', todoId, todo)        // Delete todo
emit('edit-start', todoId)          // Start editing
emit('edit-end', todoId)            // End editing
```

#### Exposed Methods
```javascript
// Available via template ref
todoItemRef.value.startEdit()      // Start edit mode
todoItemRef.value.cancelEdit()     // Cancel edit mode
todoItemRef.value.isEditing()      // Check if editing
```

### TodoInput Component

#### Props
```javascript
const props = {
  placeholder: {
    type: String,
    default: 'Nhập nội dung todo...'
  },
  maxLength: {
    type: Number,
    default: 500
  },
  submitButtonText: {
    type: String,
    default: 'Thêm'
  },
  initialValue: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
}
```

#### Events
```javascript
emit('submit', text)        // Submit new todo
emit('clear')              // Clear input
emit('input', value)       // Input change
```

#### Exposed Methods
```javascript
todoInputRef.value.focus()          // Focus input
todoInputRef.value.clear()          // Clear input
todoInputRef.value.getValue()       // Get current value
todoInputRef.value.setValue(value)  // Set input value
```

### TodoFilters Component

#### Props
```javascript
const props = {
  currentFilter: {
    type: String,
    default: 'all',
    validator: (value) => ['all', 'active', 'completed'].includes(value)
  },
  totalCount: Number,
  activeCount: Number,
  completedCount: Number,
  showStats: {
    type: Boolean,
    default: true
  },
  showCounts: {
    type: Boolean,
    default: true
  }
}
```

#### Events
```javascript
emit('filter-change', filterName)   // Filter selection change
```

## 🔌 Integration Examples

### Basic Usage
```javascript
// In component setup
const {
  todos,
  addTodo,
  deleteTodo,
  isLoading
} = useTodos()

// Add todo
const handleAdd = async (text) => {
  const success = await addTodo(text)
  if (success) {
    // Success feedback already handled by composable
  }
}

// Delete todo
const handleDelete = async (id, todo) => {
  await deleteTodo(id, todo) // Includes confirmation dialog
}
```

### Advanced Usage
```javascript
// Direct store access (for complex scenarios)
import { useTodoStore } from '@/stores/todos.js'

const store = useTodoStore()

// Batch operations
const batchUpdate = () => {
  store.$patch((state) => {
    state.todos.forEach(todo => {
      if (todo.completed) {
        todo.updatedAt = new Date()
      }
    })
  })
}

// Watch for changes
watch(() => store.totalCount, (newCount) => {
  console.log(`Todo count changed: ${newCount}`)
})
```

### Error Handling
```javascript
// Global error handling
const { error, clearError } = useTodos()

watch(error, (newError) => {
  if (newError) {
    console.error('Todo operation failed:', newError)
    // Custom error handling
    clearError()
  }
})
```

## 🔄 State Synchronization

### LocalStorage Sync
```javascript
// Automatic save với debouncing (300ms)
// Manual save
import { StorageService } from '@/utils/storage.js'
StorageService.saveTodos(todos.value)

// Manual load
const savedTodos = StorageService.loadTodos()
```

### Cross-Component Communication
```javascript
// Via composable (recommended)
const { setFilter } = useTodos()
setFilter('completed')

// Via store (advanced)
const store = useTodoStore()
store.setFilter('active')
```

## 📊 Performance Considerations

### Debouncing
- **Storage saves**: 300ms debounce
- **Input validation**: Real-time
- **UI updates**: Immediate (reactive)

### Optimization Tips
```javascript
// Use computed for expensive operations
const expensiveComputation = computed(() => {
  return todos.value.filter(/* complex logic */)
})

// Avoid watchers for simple reactive updates
// Good: computed properties
// Avoid: watch for simple derivations
```