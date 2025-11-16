export type TodoCategory = '工作' | '学习' | '生活' | '其他';
export type TodoPriority = '高' | '中' | '低';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: number;
  category: TodoCategory;
  priority: TodoPriority;
  dueDate?: number; // 截止日期时间戳（可选）
}

export type SortOption = 'priority' | 'dueDate' | 'createdAt' | 'none';
export type FilterOption = TodoCategory | '全部';

