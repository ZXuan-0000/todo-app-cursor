import { useState, useEffect, useMemo } from 'react'
import TodoList from './components/TodoList'
import AddTodo from './components/AddTodo'
import TodoControls from './components/TodoControls'
import { Todo, TodoCategory, TodoPriority, SortOption, FilterOption } from './types'
import { loadTodos, saveTodos, exportTodosToFile, importTodosFromFile } from './utils/storage'
import { sortTodos } from './utils/sort'
import './App.css'

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    // 从 localStorage 加载数据
    return loadTodos()
  })

  const [sortOption, setSortOption] = useState<SortOption>('none')
  const [filterOption, setFilterOption] = useState<FilterOption>('全部')

  // 保存到 localStorage
  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  // 筛选和排序待办事项
  const filteredAndSortedTodos = useMemo(() => {
    let filtered = todos

    // 按分类筛选
    if (filterOption !== '全部') {
      filtered = filtered.filter(todo => todo.category === filterOption)
    }

    // 排序
    return sortTodos(filtered, sortOption)
  }, [todos, sortOption, filterOption])

  const addTodo = (
    title: string,
    description?: string,
    category: TodoCategory = '其他',
    priority: TodoPriority = '中',
    dueDate?: number
  ) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      title,
      description,
      completed: false,
      createdAt: Date.now(),
      category,
      priority,
      dueDate,
    }
    setTodos([...todos, newTodo])
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  const handleExport = () => {
    exportTodosToFile(todos)
  }

  const handleImport = async (file: File) => {
    try {
      const importedTodos = await importTodosFromFile(file)
      // 合并导入的数据，避免 ID 冲突
      const mergedTodos = [...todos]
      importedTodos.forEach(importedTodo => {
        // 如果 ID 已存在，则更新；否则添加
        const existingIndex = mergedTodos.findIndex(t => t.id === importedTodo.id)
        if (existingIndex >= 0) {
          mergedTodos[existingIndex] = importedTodo
        } else {
          mergedTodos.push(importedTodo)
        }
      })
      setTodos(mergedTodos)
      alert('导入成功！')
    } catch (error) {
      alert('导入失败：' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📝 TODO List</h1>
        <p>管理您的待办事项</p>
      </header>
      <AddTodo onAdd={addTodo} />
      <TodoControls
        sortOption={sortOption}
        filterOption={filterOption}
        onSortChange={setSortOption}
        onFilterChange={setFilterOption}
        onExport={handleExport}
        onImport={handleImport}
      />
      <TodoList
        todos={filteredAndSortedTodos}
        onDelete={deleteTodo}
        onToggle={toggleTodo}
      />
    </div>
  )
}

export default App

