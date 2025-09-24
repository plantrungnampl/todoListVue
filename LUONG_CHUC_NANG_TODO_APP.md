# Tài Liệu Phân Tích Luồng Chức Năng - Vue Todo App

## 📋 Tổng Quan

Đây là tài liệu phân tích chi tiết luồng xử lý của 3 chức năng chính trong ứng dụng Todo được xây dựng bằng Vue.js 3:

- **Thêm Todo** (Create)
- **Chỉnh sửa Todo** (Update)
- **Xóa Todo** (Delete)

## 🏗️ Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  TodoView.vue  │  TodoInput.vue  │  TodoItem.vue            │
│  (Main View)   │  (Add Todo)     │  (Todo Item)             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                     │
├─────────────────────────────────────────────────────────────┤
│              useTodos.js (Composable)                       │
│         • UI Feedback Management                            │
│         • Error Handling                                    │
│         • Toast Notifications                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     STATE MANAGEMENT                        │
├─────────────────────────────────────────────────────────────┤
│                 stores/todos.js (Pinia)                     │
│         • State Management                                  │
│         • Data Validation                                   │
│         • Business Rules                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     UTILITY LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  validation.js  │  storage.js   │  helpers.js              │
│  (Validation)   │  (Storage)    │  (Utilities)             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PERSISTENCE LAYER                        │
├─────────────────────────────────────────────────────────────┤
│                    localStorage                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ LUỒNG THÊM TODO

### Sơ Đồ Luồng
```
    [User Input]
         │
         ▼
┌─────────────────┐
│  TodoInput.vue  │ ◄─── validateTodoText()
│                 │      utils/validation.js
└─────────────────┘
         │
         │ emit('submit', text)
         ▼
┌─────────────────┐
│  TodoView.vue   │
│ handleAddTodo() │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  useTodos.js    │ ◄─── showToast() feedback
│   addTodo()     │      vant UI library
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ stores/todos.js │ ◄─── validateTodoText()
│   addTodo()     │      createTodo()
└─────────────────┘      utils/helpers.js
         │
         ▼
┌─────────────────┐
│ StorageService  │ ◄─── Debounced save (300ms)
│  saveTodos()    │
└─────────────────┘
         │
         ▼
   [localStorage]
```

### Chi Tiết Các Bước

#### Bước 1: User Interface (TodoInput.vue:110-133)
```javascript
function handleSubmit() {
  if (!canSubmit.value) return

  const trimmedText = inputText.value.trim()

  // Validation
  if (!validateInput(trimmedText)) {
    return
  }

  // Emit to parent
  emit('submit', trimmedText)

  // Reset form
  inputText.value = ''
  validationError.value = ''
}
```

#### Bước 2: View Controller (TodoView.vue:195-202)
```javascript
async function handleAddTodo(text) {
  const success = await addTodo(text)
  if (success) {
    // Switch to 'ALL' filter if currently on 'COMPLETED'
    if (currentFilter.value === TODO_FILTERS.COMPLETED) {
      setFilter(TODO_FILTERS.ALL)
    }
  }
}
```

#### Bước 3: Business Logic (useTodos.js:25-43)
```javascript
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
```

#### Bước 4: State Management (stores/todos.js:81-101)
```javascript
function addTodo(text) {
  // Validation
  const validation = validateTodoText(text)
  if (!validation.isValid) {
    return { success: false, errors: validation.errors }
  }

  // Create new todo
  const newTodo = createTodo(validation.sanitizedText)

  // Add to state
  todos.value.unshift(newTodo)

  // Save to storage (debounced)
  debouncedSave()

  return { success: true, todo: newTodo }
}
```

#### Bước 5: Persistence (StorageService:54-56)
```javascript
static saveTodos(todos) {
  return this.save(LOCAL_STORAGE_KEY, todos)
}
```

---

## 2️⃣ LUỒNG CHỈNH SỬA TODO

### Sơ Đồ Luồng
```
    [Double Click / Edit Button]
         │
         ▼
┌─────────────────┐
│   TodoItem.vue  │
│  startEditing() │ ◄─── Focus & select input
└─────────────────┘
         │
         │ Edit mode activated
         ▼
┌─────────────────┐
│  van-field      │ ◄─── validateTodoText()
│  (Edit Input)   │      Real-time validation
└─────────────────┘
         │
         │ Enter key / Save button
         ▼
┌─────────────────┐
│   TodoItem.vue  │ ◄─── Validation check
│   saveEdit()    │      canSave computed
└─────────────────┘
         │
         │ emit('update', id, updates)
         ▼
┌─────────────────┐
│  TodoView.vue   │
│handleUpdateTodo()│
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  useTodos.js    │ ◄─── showToast() feedback
│  updateTodo()   │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ stores/todos.js │ ◄─── Find todo by ID
│  updateTodo()   │      Validate updates
└─────────────────┘      Update timestamp
         │
         ▼
┌─────────────────┐
│ StorageService  │ ◄─── Debounced save
│  saveTodos()    │
└─────────────────┘
         │
         ▼
   [localStorage]
```

### Chi Tiết Các Bước

#### Bước 1: Trigger Edit Mode (TodoItem.vue:227-243)
```javascript
async function startEditing() {
  if (props.disabled || isLoading.value) return

  isEditing.value = true
  editText.value = props.todo.text
  editError.value = ''

  emit('edit-start', props.todo.id)

  // Focus and select input
  await nextTick()
  const input = document.querySelector('.todo-edit .van-field__control')
  if (input) {
    input.focus()
    input.select()
  }
}
```

#### Bước 2: Save Edit (TodoItem.vue:245-265)
```javascript
function saveEdit() {
  if (!canSave.value) return

  const trimmedText = editText.value.trim()

  // Validation
  if (!validateEdit(trimmedText)) {
    return
  }

  // Emit update
  emit('update', props.todo.id, { text: trimmedText })

  // Exit edit mode
  isEditing.value = false
  emit('edit-end', props.todo.id)
}
```

#### Bước 3: View Handler (TodoView.vue:204-206)
```javascript
async function handleUpdateTodo(id, updates) {
  await updateTodo(id, updates)
}
```

#### Bước 4: Business Logic (useTodos.js:49-67)
```javascript
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
```

#### Bước 5: State Update (stores/todos.js:107-148)
```javascript
function updateTodo(id, updates) {
  // Validate ID
  if (!validateTodoId(id)) {
    return { success: false, errors: ['Invalid todo ID'] }
  }

  // Find todo
  const todoIndex = todos.value.findIndex(todo => todo.id === id)
  if (todoIndex === -1) {
    return { success: false, errors: ['Todo not found'] }
  }

  // Validate text if updating
  if (updates.text !== undefined) {
    const validation = validateTodoText(updates.text)
    if (!validation.isValid) {
      return { success: false, errors: validation.errors }
    }
    updates.text = validation.sanitizedText
  }

  // Update todo
  const updatedTodo = {
    ...todos.value[todoIndex],
    ...updates,
    updatedAt: new Date()
  }

  todos.value[todoIndex] = updatedTodo
  debouncedSave()

  return { success: true, todo: updatedTodo }
}
```

---

## 3️⃣ LUỒNG XÓA TODO

### Sơ Đồ Luồng
```
    [Swipe Action / Delete Button]
         │
         ▼
┌─────────────────┐
│   TodoItem.vue  │
│ handleDelete()  │
└─────────────────┘
         │
         │ emit('delete', id, todo)
         ▼
┌─────────────────┐
│  TodoView.vue   │
│handleDeleteTodo()│
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  useTodos.js    │ ◄─── showConfirmDialog()
│  deleteTodo()   │      User confirmation
└─────────────────┘
         │
         │ User confirms
         ▼
┌─────────────────┐
│ stores/todos.js │ ◄─── Find todo by ID
│  deleteTodo()   │      Remove from array
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ StorageService  │ ◄─── Debounced save
│  saveTodos()    │
└─────────────────┘
         │
         ▼
   [localStorage]
```

### Chi Tiết Các Bước

#### Bước 1: Trigger Delete (TodoItem.vue:214-225)
```javascript
function handleDelete() {
  if (props.disabled || isDeleting.value) return

  try {
    isDeleting.value = true
    emit('delete', props.todo.id, props.todo)
  } catch (error) {
    console.error('Error deleting todo:', error)
  } finally {
    isDeleting.value = false
  }
}
```

#### Bước 2: View Handler (TodoView.vue:208-210)
```javascript
async function handleDeleteTodo(id, todo) {
  await deleteTodo(id, todo)
}
```

#### Bước 3: Business Logic với Confirmation (useTodos.js:73-103)
```javascript
async function deleteTodo(id, todo) {
  try {
    // Show confirmation dialog
    await showConfirmDialog({
      title: 'Xác nhận xóa',
      message: `Bạn có chắc muốn xóa todo "${todo.text}"?`,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#ee0a24'
    })

    // If confirmed, delete
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
```

#### Bước 4: State Management (stores/todos.js:154-179)
```javascript
function deleteTodo(id) {
  // Validate ID
  if (!validateTodoId(id)) {
    return { success: false, errors: ['Invalid todo ID'] }
  }

  // Find todo
  const todoIndex = todos.value.findIndex(todo => todo.id === id)
  if (todoIndex === -1) {
    return { success: false, errors: ['Todo not found'] }
  }

  // Remove todo
  const deletedTodo = todos.value[todoIndex]
  todos.value.splice(todoIndex, 1)

  // Save to storage
  debouncedSave()

  return { success: true, todo: deletedTodo }
}
```

---

## 🔧 Chi Tiết Các Thành Phần

### 1. Validation System (utils/validation.js)

```javascript
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
```

### 2. Storage System (utils/storage.js)

**Đặc điểm:**
- Sử dụng localStorage để lưu trữ persistent
- Automatic JSON serialization/deserialization
- Error handling cho storage operations
- Debounced save để optimize performance (300ms)

### 3. State Management (Pinia Store)

**Computed Properties:**
- `filteredTodos`: Filtered by search query và filter status
- `totalCount`, `activeCount`, `completedCount`: Statistics
- `hasCompleted`, `allCompleted`: Boolean states

**Actions:**
- Tất cả actions return `{ success: boolean, errors?: string[] }` format
- Automatic error handling và state management
- Debounced storage saves

### 4. UI Feedback System

**Toast Notifications:**
- Success: Green toast, 1.5s duration
- Error: Red toast, 3s duration
- Clear messaging trong tiếng Việt

**Confirmation Dialogs:**
- Delete actions require user confirmation
- Customizable colors và text
- Promise-based API

---

## 🎯 Đặc Điểm Nổi Bật

### 1. **Layered Architecture**
- Clear separation of concerns
- Each layer có responsibility riêng biệt
- Easy to test và maintain

### 2. **Comprehensive Error Handling**
- Validation at multiple levels
- User-friendly error messages
- Graceful degradation

### 3. **Performance Optimizations**
- Debounced storage saves (300ms)
- Computed properties for reactive data
- Efficient array operations

### 4. **User Experience**
- Real-time validation feedback
- Loading states và disabled states
- Smooth transitions và animations
- Mobile-responsive design

### 5. **Data Integrity**
- Input sanitization
- ID validation
- Type checking
- Consistent data format

---

## 📱 Platform Compatibility

### Desktop Features:
- Hover effects cho buttons
- Keyboard shortcuts (Enter, Escape)
- Right-click context menu potential

### Mobile Features:
- Swipe gestures for delete
- Touch-friendly button sizes
- Responsive layout
- iOS Safari zoom prevention

---

## 🔒 Security Considerations

1. **Input Sanitization**: Tất cả user input được validate và sanitize
2. **XSS Prevention**: Text content được properly escaped
3. **Client-side Storage**: Chỉ sử dụng localStorage, không có sensitive data
4. **Error Information**: Error messages không expose internal system details

---

## 🚀 Future Enhancement Possibilities

1. **API Integration**: Replace localStorage với REST API
2. **Real-time Sync**: WebSocket support for multi-device sync
3. **Offline Support**: Service Worker implementation
4. **Advanced Features**: Categories, tags, due dates, attachments
5. **Collaboration**: Multi-user support với permission system

---

*Document được tạo bởi Claude Code - phân tích chi tiết codebase Vue Todo App*