  <template>
  <div
    class="todo-item"
    :class="{
      'todo-item--completed': todo.completed,
      'todo-item--editing': isEditing
    }"
  >
    <van-swipe-cell
      v-if="!isEditing"
      :right-width="80"
      :before-close="beforeClose"
    >
      <!-- Main todo content -->
      <div class="todo-content" @click="handleToggle">
        <van-checkbox
          :model-value="todo.completed"
          :disabled="isLoading"
          @click.stop="handleToggle"
        />

        <div class="todo-text-section" @dblclick="startEditing">
          <div class="todo-text" :class="{ 'completed': todo.completed }">
            {{ todo.text }}
          </div>
          <div class="todo-meta">
            <span class="todo-date">{{ formattedDate }}</span>
            <span v-if="todo.priority && todo.priority !== 'medium'" class="todo-priority">
              {{ priorityText }}
            </span>
          </div>
        </div>

        <van-button
          v-if="!isLoading"
          type="default"
          size="mini"
          icon="edit"
          @click.stop="startEditing"
        />
      </div>

      <!-- Swipe action: Delete -->
      <template #right>
        <van-button
          type="danger"
          class="delete-button"
          :loading="isDeleting"
          @click="handleDelete"
        >
          Xóa
        </van-button>
      </template>
    </van-swipe-cell>

    <!-- Edit mode -->
    <div v-else class="todo-edit">
      <van-field
        v-model="editText"
        :maxlength="500"
        :error="hasEditError"
        :error-message="editErrorMessage"
        autofocus
        show-word-limit
        @keyup.enter="saveEdit"
        @keyup.escape="cancelEdit"
      />

      <div class="edit-actions">
        <van-button
          size="small"
          :loading="isSaving"
          :disabled="!canSave"
          type="primary"
          @click="saveEdit"
        >
          Lưu
        </van-button>
        <van-button
          size="small"
          :disabled="isSaving"
          @click="cancelEdit"
        >
          Hủy
        </van-button>
      </div>
    </div>

    <!-- Loading overlay -->
    <van-loading
      v-if="isLoading"
      class="loading-overlay"
      color="#1989fa"
      size="20px"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { validateTodoText } from '@/utils/validation.js'
import { formatRelativeTime } from '@/utils/helpers.js'

// Props
const props = defineProps({
  todo: {
    type: Object,
    required: true,
    validator: (todo) => {
      return todo &&
             typeof todo.id === 'string' &&
             typeof todo.text === 'string' &&
             typeof todo.completed === 'boolean'
    }
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'toggle',
  'update',
  'delete',
  'edit-start',
  'edit-end'
])

// State
const isEditing = ref(false)
const editText = ref('')
const isLoading = ref(false)
const isDeleting = ref(false)
const isSaving = ref(false)
const editError = ref('')

// Computed
const formattedDate = computed(() => {
  return formatRelativeTime(props.todo.createdAt)
})

const priorityText = computed(() => {
  const priorities = {
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao'
  }
  return priorities[props.todo.priority] || ''
})

const hasEditError = computed(() => !!editError.value)
const editErrorMessage = computed(() => editError.value)

const canSave = computed(() => {
  return editText.value.trim().length > 0 &&
         editText.value.trim() !== props.todo.text &&
         !hasEditError.value &&
         !isSaving.value
})

// Watch for prop changes
watch(() => props.todo.text, (newText) => {
  if (!isEditing.value) {
    editText.value = newText
  }
})

// Methods
function validateEdit(text) {
  const validation = validateTodoText(text)

  if (!validation.isValid) {
    editError.value = validation.errors[0] || 'Invalid input'
    return false
  }

  editError.value = ''
  return true
}

async function handleToggle() {
  if (props.disabled || isLoading.value || isEditing.value) return

  try {
    isLoading.value = true
    await emit('toggle', props.todo.id)
  } catch (error) {
    console.error('Error toggling todo:', error)
  } finally {
    isLoading.value = false
  }
}

async function handleDelete() {
  if (props.disabled || isDeleting.value) return

  try {
    isDeleting.value = true
    await emit('delete', props.todo.id, props.todo)
  } catch (error) {
    console.error('Error deleting todo:', error)
  } finally {
    isDeleting.value = false
  }
}

async function startEditing() {
  if (props.disabled || isLoading.value) return

  isEditing.value = true
  editText.value = props.todo.text
  editError.value = ''

  emit('edit-start', props.todo.id)

  // Focus the input field
  await nextTick()
  const input = document.querySelector('.todo-edit .van-field__control')
  if (input) {
    input.focus()
    input.select()
  }
}

async function saveEdit() {
  if (!canSave.value) return

  const trimmedText = editText.value.trim()

  if (!validateEdit(trimmedText)) {
    return
  }

  try {
    isSaving.value = true
    await emit('update', props.todo.id, { text: trimmedText })
    isEditing.value = false
    emit('edit-end', props.todo.id)
  } catch (error) {
    console.error('Error saving todo:', error)
    editError.value = 'Có lỗi xảy ra khi lưu'
  } finally {
    isSaving.value = false
  }
}

function cancelEdit() {
  isEditing.value = false
  editText.value = props.todo.text
  editError.value = ''
  emit('edit-end', props.todo.id)
}

function beforeClose({ position, instance }) {
  if (position === 'right') {
    // Handle delete action
    handleDelete()
    return false // Prevent automatic close
  }
  return true
}

// Expose methods to parent
defineExpose({
  startEdit: startEditing,
  cancelEdit: cancelEdit,
  isEditing: () => isEditing.value
})
</script>

<style scoped>
.todo-item {
  position: relative;
  background-color: #fff;
  border-bottom: 1px solid #ebedf0;
  transition: all 0.3s ease;
}

.todo-item:hover {
  background-color: #f7f8fa;
}

.todo-item--completed {
  opacity: 0.6;
}

.todo-item--editing {
  background-color: #f0f9ff;
}

.todo-content {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.todo-text-section {
  flex: 1;
  min-width: 0;
}

.todo-text {
  font-size: 16px;
  line-height: 1.5;
  color: #323233;
  word-wrap: break-word;
  transition: all 0.3s ease;
}

.todo-text.completed {
  text-decoration: line-through;
  color: #969799;
}

.todo-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.todo-date {
  font-size: 12px;
  color: #969799;
}

.todo-priority {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  background-color: #f2f3f5;
  color: #646566;
}

.todo-edit {
  padding: 16px;
  background-color: #f0f9ff;
}

.edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  justify-content: flex-end;
}

.delete-button {
  height: 100%;
  width: 80px;
  border-radius: 0;
}

.loading-overlay {
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  z-index: 1;
}

/* Animations */
.todo-item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .todo-content {
    padding: 12px 16px;
  }

  .todo-text {
    font-size: 16px; /* Prevent zoom on iOS */
  }

  .edit-actions {
    justify-content: stretch;
  }

  .edit-actions .van-button {
    flex: 1;
  }
}

/* Touch-friendly button sizes */
.van-button--mini {
  min-height: 32px;
  min-width: 32px;
}

/* Accessibility */
.todo-content:focus-visible {
  outline: 2px solid #1989fa;
  outline-offset: -2px;
}

.van-checkbox {
  --van-checkbox-size: 20px;
}

/* Dark mode support (if needed) */
@media (prefers-color-scheme: dark) {
  .todo-item {
    background-color: #1a1a1a;
    border-color: #333;
  }

  .todo-text {
    color: #fff;
  }

  .todo-text.completed {
    color: #888;
  }

  .todo-date {
    color: #888;
  }
}
</style>