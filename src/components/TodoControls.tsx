import { SortOption, FilterOption, TodoCategory } from '../types'
import './TodoControls.css'

interface TodoControlsProps {
  sortOption: SortOption
  filterOption: FilterOption
  onSortChange: (option: SortOption) => void
  onFilterChange: (option: FilterOption) => void
  onExport: () => void
  onImport: (file: File) => void
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'none', label: '默认' },
  { value: 'priority', label: '按优先级' },
  { value: 'dueDate', label: '按截止日期' },
  { value: 'createdAt', label: '按创建时间' },
]

const filterOptions: FilterOption[] = ['全部', '工作', '学习', '生活', '其他']

export default function TodoControls({
  sortOption,
  filterOption,
  onSortChange,
  onFilterChange,
  onExport,
  onImport,
}: TodoControlsProps) {
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImport(file)
      // 重置 input，以便可以再次选择同一文件
      e.target.value = ''
    }
  }

  return (
    <div className="todo-controls">
      <div className="controls-row">
        <div className="control-group">
          <label className="control-label">排序方式</label>
          <select
            className="control-select"
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="control-group">
          <label className="control-label">分类筛选</label>
          <select
            className="control-select"
            value={filterOption}
            onChange={(e) => onFilterChange(e.target.value as FilterOption)}
          >
            {filterOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="controls-actions">
        <label className="btn-secondary btn-file">
          📥 导入数据
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </label>
        <button className="btn-secondary" onClick={onExport}>
          📤 导出数据
        </button>
      </div>
    </div>
  )
}

