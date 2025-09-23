# Vue TodoList - Architecture Documentation

## 📚 Tổng quan Architecture

Ứng dụng TodoList được xây dựng theo **Clean Architecture** và **Domain-Driven Design (DDD)** principles, đảm bảo code maintainable, testable và scalable.

### 🏗️ Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Views     │  │ Components  │  │ Composables │    │
│  │ TodoView    │  │ TodoItem    │  │  useTodos   │    │
│  │             │  │ TodoInput   │  │             │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────┐
│                  Application Layer                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Stores    │  │ Validation  │  │   Helpers   │    │
│  │   Pinia     │  │   Logic     │  │  Utilities  │    │
│  │             │  │             │  │             │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────┐
│                   Domain Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │    Types    │  │ Interfaces  │  │ Constants   │    │
│  │  Todo.js    │  │ Validators  │  │  Filters    │    │
│  │             │  │             │  │             │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────┐
│                Infrastructure Layer                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Storage    │  │  HTTP API   │  │  External   │    │
│  │ LocalStorage│  │   Axios     │  │ Libraries   │    │
│  │             │  │             │  │   Vant UI   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Design Patterns

### 1. Repository Pattern
```javascript
// StorageService acts as repository
class StorageService {
  static saveTodos(todos) { /* localStorage operations */ }
  static loadTodos() { /* localStorage operations */ }
}
```

### 2. Observer Pattern (Reactive Programming)
```javascript
// Pinia store with reactive state
const todos = ref([])
const filteredTodos = computed(() => /* filter logic */)
```

### 3. Strategy Pattern
```javascript
// Different validation strategies
export function validateTodoText(text) { /* validation logic */ }
export function validateTodoData(data) { /* validation logic */ }
```

### 4. Facade Pattern
```javascript
// useTodos composable hides complexity
export function useTodos() {
  // Simplified interface for components
  return { addTodo, deleteTodo, toggleTodo, ... }
}
```

### 5. Command Pattern
```javascript
// Each action returns result object
function addTodo(text) {
  return { success: true|false, data?, errors? }
}
```

## 🔄 Data Flow

### 1. User Interaction Flow
```
User Input → Component → Composable → Store → Storage
     ↑                                           ↓
User Feedback ← Toast/Dialog ← UI Update ← State Change
```

### 2. State Management Flow
```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Component   │───→│  Composable  │───→│    Store     │
│ (TodoView)   │    │ (useTodos)   │    │ (TodoStore)  │
└──────────────┘    └──────────────┘    └──────────────┘
       ↑                     ↑                     ↓
       │                     │            ┌──────────────┐
       │                     │            │   Storage    │
       │                     │            │(LocalStorage)│
       │                     │            └──────────────┘
       │                     │                     ↓
       │            ┌──────────────┐    ┌──────────────┐
       └────────────│ UI Feedback  │←───│    State     │
                    │(Toast/Dialog)│    │   Update     │
                    └──────────────┘    └──────────────┘
```

## 🧩 Component Architecture

### 1. Component Hierarchy
```
TodoView (Container)
├── TodoInput (Smart Component)
├── TodoFilters (Presentation)
├── TodoActions (Smart Component)
└── TodoItem[] (Smart Component)
```

### 2. Component Communication
```javascript
// Parent to Child (Props)
<TodoItem :todo="todo" :disabled="loading" />

// Child to Parent (Events)
@toggle="handleToggle"
@delete="handleDelete"

// Global State (Composables)
const { todos, addTodo } = useTodos()
```

## 🛡️ Error Handling Strategy

### 1. Layered Error Handling
```
┌─────────────────┐
│   UI Layer      │ ← Toast messages, visual feedback
├─────────────────┤
│ Business Layer  │ ← Validation, business rules
├─────────────────┤
│ Service Layer   │ ← API errors, storage errors
├─────────────────┤
│Infrastructure   │ ← Network, localStorage errors
└─────────────────┘
```

### 2. Error Response Pattern
```javascript
// Consistent error response format
return {
  success: boolean,
  data?: any,
  errors?: string[],
  message?: string
}
```

## 📊 Performance Considerations

### 1. Optimizations Implemented
- **Debounced Storage**: Prevent excessive localStorage writes
- **Computed Properties**: Efficient reactive filtering
- **Lazy Loading**: Route-based code splitting
- **Virtual Scrolling**: Ready for large lists (future)

### 2. Memory Management
- **Reactive Cleanup**: Proper component unmounting
- **Event Listeners**: Automatic cleanup in composables
- **Reference Management**: Avoid memory leaks

## 🔐 Security Measures

### 1. Input Sanitization
```javascript
// XSS Prevention
const sanitizedText = text.trim()
// Length validation
if (text.length > 500) throw new Error('Too long')
```

### 2. Data Validation
```javascript
// Type safety
if (typeof todo !== 'object') return error
// Structure validation
if (!todo.id || !todo.text) return error
```

## 🧪 Testing Strategy

### 1. Unit Testing Layers
```
├── Utils Testing (Pure functions)
├── Store Testing (Business logic)
├── Composable Testing (Integration)
└── Component Testing (UI behavior)
```

### 2. Test Categories
- **Unit Tests**: Individual functions
- **Integration Tests**: Component + Store
- **E2E Tests**: User workflows
- **Performance Tests**: Large datasets

## 📈 Scalability Considerations

### 1. Horizontal Scaling
- **Module Federation**: Micro-frontend ready
- **API Integration**: Backend service ready
- **State Sharing**: Cross-app state management

### 2. Vertical Scaling
- **Performance**: Virtual scrolling, pagination
- **Features**: Plugin architecture ready
- **Data**: Database integration ready

## 🔧 Development Workflow

### 1. Code Quality Gates
```bash
# Pre-commit hooks
npm run lint      # ESLint + Oxlint
npm run format    # Prettier
npm run test      # Unit tests
npm run build     # Build verification
```

### 2. Development Process
1. **Feature Planning**: Architecture design
2. **Implementation**: TDD approach
3. **Code Review**: Quality assurance
4. **Testing**: Multi-layer testing
5. **Documentation**: Living documentation

## 🚀 Deployment Architecture

### 1. Build Process
```
Source Code → Vite Build → Static Assets → CDN/Server
     ↓              ↓            ↓            ↓
  Tree Shaking → Minification → Compression → Caching
```

### 2. Environment Configuration
- **Development**: Hot reload, debugging
- **Staging**: Production-like testing
- **Production**: Optimized builds, monitoring

## 📝 Best Practices Implemented

### 1. Code Organization
- **Single Responsibility**: Each file has one purpose
- **Dependency Injection**: Loosely coupled modules
- **Interface Segregation**: Focused APIs

### 2. Performance
- **Lazy Loading**: Route-based splitting
- **Memoization**: Computed properties
- **Debouncing**: User input handling

### 3. Maintainability
- **Documentation**: Comprehensive docs
- **TypeScript**: Type safety with JSDoc
- **Testing**: High test coverage

### 4. User Experience
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliance ready
- **Progressive Enhancement**: Core functionality first