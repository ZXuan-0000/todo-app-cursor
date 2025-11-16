import { Todo } from '../types';

const STORAGE_KEY = 'todos';

/**
 * 从 localStorage 加载待办事项
 */
export function loadTodos(): Todo[] {
  try {
    const savedTodos = localStorage.getItem(STORAGE_KEY);
    if (savedTodos) {
      const todos = JSON.parse(savedTodos);
      // 验证数据格式，确保新字段有默认值
      return todos.map((todo: any) => ({
        ...todo,
        category: todo.category || '其他',
        priority: todo.priority || '中',
        dueDate: todo.dueDate || undefined,
      }));
    }
    return [];
  } catch (error) {
    console.error('加载待办事项失败:', error);
    return [];
  }
}

/**
 * 保存待办事项到 localStorage
 */
export function saveTodos(todos: Todo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error('保存待办事项失败:', error);
  }
}

/**
 * 导出待办事项为 JSON 文件
 */
export function exportTodosToFile(todos: Todo[]): void {
  try {
    const dataStr = JSON.stringify(todos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todos-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('导出待办事项失败:', error);
    alert('导出失败，请重试');
  }
}

/**
 * 从 JSON 文件导入待办事项
 */
export function importTodosFromFile(file: File): Promise<Todo[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const todos = JSON.parse(content);
        if (Array.isArray(todos)) {
          resolve(todos);
        } else {
          reject(new Error('文件格式不正确'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsText(file);
  });
}

