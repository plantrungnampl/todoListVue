import { LOCAL_STORAGE_KEY } from '@/types/todo.js'

export class StorageService {
  /**
   * Save data to localStorage
x
   */
  static save(key, data) {
    try {
      const serializedData = JSON.stringify(data)
      localStorage.setItem(key, serializedData)
      return true
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
      return false
    }
  }

  /**
   * Load data from localStorage

   */
  static load(key, defaultValue = null) {
    try {
      const serializedData = localStorage.getItem(key)
      if (serializedData === null) {
        return defaultValue
      }
      return JSON.parse(serializedData)
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      return defaultValue
    }
  }

  /**
   * Remove data from localStorage

   */
  static remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Failed to remove from localStorage:', error)
      return false
    }
  }

  /**
   * Save todos to localStorage

   */
  static saveTodos(todos) {
    return this.save(LOCAL_STORAGE_KEY, todos)
  }

  /**
   * Load todos from localStorage
   */
  static loadTodos() {
    return this.load(LOCAL_STORAGE_KEY, [])
  }
}