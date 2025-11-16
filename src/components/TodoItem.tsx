import { Todo } from '../types'
import './TodoItem.css'

interface TodoItemProps {
  todo: Todo
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}

const priorityColors = {
  高: '#ff4444',
  中: '#ffaa00',
  低: '#44aa44',
}

const categoryColors = {
  工作: '#667eea',
  学习: '#764ba2',
  生活: '#f093fb',
  其他: '#4facfe',
}

export default function TodoItem({ todo, onDelete, onToggle }: TodoItemProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return '今天'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明天'
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    }
  }

  const isOverdue = todo.dueDate && !todo.completed && todo.dueDate < Date.now()

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}>
      <div className="todo-content">
        <input
          type="checkbox"
          className="todo-checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
        <div className="todo-text">
          <div className="todo-header">
            <h3 className="todo-title">{todo.title}</h3>
            <div className="todo-badges">
              <span
                className="badge badge-category"
                style={{ backgroundColor: categoryColors[todo.category] }}
              >
                {todo.category}
              </span>
              <span
                className="badge badge-priority"
                style={{ backgroundColor: priorityColors[todo.priority] }}
              >
                {todo.priority}
              </span>
            </div>
          </div>
          {todo.description && (
            <p className="todo-description">{todo.description}</p>
          )}
          {todo.dueDate && (
            <p className={`todo-due-date ${isOverdue ? 'overdue-text' : ''}`}>
              📅 {formatDate(todo.dueDate)}
              {isOverdue && ' (已逾期)'}
            </p>
          )}
        </div>
      </div>
      <button
        className="delete-btn"
        onClick={() => onDelete(todo.id)}
        aria-label="删除待办事项"
      >
        🗑️
      </button>
    </div>
  )
}

