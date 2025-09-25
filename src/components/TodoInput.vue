<template>
  <div class="todo-input">
    <van-field
      v-model="inputText"
      :placeholder="placeholder"
      :maxlength="maxLength"
      :error="hasError"
      :error-message="errorMessage"
      clearable
      autofocus
      show-word-limit
      @keyup.enter="handleSubmit"
      @clear="handleClear"
      @input="handleInput"
    >
      <template #button>
        <van-button
          type="primary"
          size="small"
          :disabled="!canSubmit"
          :loading="isSubmitting"
          @click="handleSubmit"
        >
          {{ submitButtonText }}
        </van-button>
      </template>
    </van-field>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { validateTodoText } from '@/utils/validation.js'

// Props
const props = defineProps({
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
  autoFocus: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['submita', 'clear', 'input'])

// State
const inputText = ref(props.initialValue)
const isSubmitting = ref(false)
const validationError = ref('')

// Computed
const hasError = computed(() => !!validationError.value)
const errorMessage = computed(() => validationError.value)

const canSubmit = computed(() => {
  return !props.disabled &&
         !isSubmitting.value &&
         inputText.value.trim().length > 0 &&
         !hasError.value
})

// Watch for prop changes
watch(() => props.initialValue, (newValue) => {
  inputText.value = newValue
})

// Methods
function validateInput(text) {
  const validation = validateTodoText(text)

  if (!validation.isValid) {
    validationError.value = validation.errors[0] || 'Invalid input'
    return false
  }

  validationError.value = ''
  return true
}

function handleInput(value) {
  console.log(value)
  // Clear validation error when user starts typing
  if (validationError.value && value.data.trim().length > 0) {
    validationError.value = ''
  }

  emit('input', value)
}

 function handleSubmit() {
  if (!canSubmit.value) return

  const trimmedText = inputText.value.trim()

  if (!validateInput(trimmedText)) {
    return
  }

  try {
    isSubmitting.value = true

     emit('submita', trimmedText)

    inputText.value = ''
    validationError.value = ''

  } catch (error) {
    console.error('Error submitting todo:', error)
    validationError.value = 'Có lỗi xảy ra khi thêm todo'
  } finally {
    isSubmitting.value = false
  }
}

function handleClear() {
  inputText.value = ''
  validationError.value = ''
  emit('clear')
}

function focus() {
  const fieldElement = document.querySelector('.van-field__control')
  if (fieldElement) {
    fieldElement.focus()
  }
}

// Expose methods to parent
defineExpose({
  focus,
  clear: handleClear,
  getValue: () => inputText.value,
  setValue: (value) => { inputText.value = value }
})
</script>

<style scoped>
.todo-input {
  padding: 16px;
  background-color: #fff;
  border-bottom: 1px solid #ebedf0;
}

.van-field {
  background-color: #f7f8fa;
  border-radius: 8px;
  padding: 8px 12px;
}

.van-field :deep(.van-field__control) {
  font-size: 16px;
  line-height: 1.5;
}

.van-field :deep(.van-field__button) {
  margin-left: 8px;
}

.van-field :deep(.van-field__error-message) {
  font-size: 12px;
  margin-top: 4px;
}

.van-button--small {
  padding: 0 12px;
  height: 32px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .todo-input {
    padding: 12px 16px;
  }

  .van-field :deep(.van-field__control) {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}
</style>