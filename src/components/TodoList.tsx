import { Todo } from '../types'
import TodoItem from './TodoItem'
import './TodoList.css'

interface TodoListProps {
  todos: Todo[]
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}

export default function TodoList({ todos, onDelete, onToggle }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <p>📋 还没有待办事项</p>
        <p className="empty-hint">添加您的第一个待办事项开始吧！</p>
      </div>
    )
  }

  const completedCount = todos.filter(todo => todo.completed).length
  const totalCount = todos.length
  const overdueCount = todos.filter(
    todo => todo.dueDate && !todo.completed && todo.dueDate < Date.now()
  ).length

  return (
    <div className="todo-list-container">
      <div className="todo-stats">
        <span>
          总计: {totalCount} | 已完成: {completedCount} | 待完成: {totalCount - completedCount}
          {overdueCount > 0 && <span className="overdue-count"> | 逾期: {overdueCount}</span>}
        </span>
      </div>
      <div className="todo-list">
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onDelete={onDelete}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  )
}

