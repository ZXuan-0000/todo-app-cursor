import { Todo, SortOption } from '../types';

/**
 * 对待办事项进行排序
 */
export function sortTodos(todos: Todo[], sortOption: SortOption): Todo[] {
  const sorted = [...todos];

  switch (sortOption) {
    case 'priority':
      const priorityOrder = { '高': 3, '中': 2, '低': 1 };
      return sorted.sort((a, b) => {
        // 未完成的优先显示
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    case 'dueDate':
      return sorted.sort((a, b) => {
        // 未完成的优先显示
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        // 有截止日期的优先显示
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate - b.dueDate;
      });

    case 'createdAt':
      return sorted.sort((a, b) => {
        // 未完成的优先显示
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return b.createdAt - a.createdAt; // 最新的在前
      });

    case 'none':
    default:
      return sorted.sort((a, b) => {
        // 未完成的优先显示
        return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
      });
  }
}

