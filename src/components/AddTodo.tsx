import { useState, useEffect, useRef } from 'react'
import { TodoCategory, TodoPriority } from '../types'
import { SpeechToText } from '../utils/speechRecognition'
import './AddTodo.css'

interface AddTodoProps {
  onAdd: (
    title: string,
    description?: string,
    category?: TodoCategory,
    priority?: TodoPriority,
    dueDate?: number
  ) => void
}

const categories: TodoCategory[] = ['工作', '学习', '生活', '其他']
const priorities: TodoPriority[] = ['高', '中', '低']

export default function AddTodo({ onAdd }: AddTodoProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<TodoCategory>('其他')
  const [priority, setPriority] = useState<TodoPriority>('中')
  const [dueDate, setDueDate] = useState('')
  const [showDescription, setShowDescription] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // 语音识别相关状态
  const [isListening, setIsListening] = useState(false)
  const [speechMode, setSpeechMode] = useState<'title' | 'description' | null>(null)
  const [speechError, setSpeechError] = useState<string | null>(null)
  const speechToTextRef = useRef<SpeechToText | null>(null)
  const isSupportedRef = useRef(false)

  // 初始化语音识别
  useEffect(() => {
    const speechToText = new SpeechToText()
    speechToTextRef.current = speechToText
    isSupportedRef.current = speechToText.isBrowserSupported()
    
    // 添加调试信息（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('语音识别支持检测:', {
        supported: isSupportedRef.current,
        hasSpeechRecognition: !!(window as any).SpeechRecognition,
        hasWebkitSpeechRecognition: !!(window as any).webkitSpeechRecognition,
        userAgent: navigator.userAgent
      })
    }
    
    return () => {
      // 组件卸载时停止语音识别
      speechToText.stop()
    }
  }, [])

  // 开始语音识别
  const startSpeechRecognition = (mode: 'title' | 'description') => {
    if (!isSupportedRef.current) {
      setSpeechError('您的浏览器不支持语音识别功能，请使用 Chrome 或 Edge 浏览器')
      return
    }

    setSpeechMode(mode)
    setIsListening(true)
    setSpeechError(null)

    speechToTextRef.current?.start(
      (text, isFinal) => {
        if (mode === 'title') {
          setTitle(text)
        } else {
          setDescription(text)
          if (!showDescription) {
            setShowDescription(true)
          }
        }
        
        // 如果是最终结果，自动停止
        if (isFinal) {
          stopSpeechRecognition()
        }
      },
      (error) => {
        setSpeechError(error)
        setIsListening(false)
        setSpeechMode(null)
        
        // 如果是网络错误，提供更详细的说明
        if (error.includes('网络') || error.includes('Google')) {
          console.warn('语音识别网络错误提示：Web Speech API 需要连接到 Google 服务')
        }
      },
      () => {
        // 识别结束
        setIsListening(false)
        setSpeechMode(null)
      }
    )
  }

  // 停止语音识别
  const stopSpeechRecognition = () => {
    speechToTextRef.current?.stop()
    setIsListening(false)
    setSpeechMode(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      const dueDateTimestamp = dueDate
        ? new Date(dueDate).getTime()
        : undefined
      onAdd(
        title.trim(),
        description.trim() || undefined,
        category,
        priority,
        dueDateTimestamp
      )
      setTitle('')
      setDescription('')
      setCategory('其他')
      setPriority('中')
      setDueDate('')
      setShowDescription(false)  // ← 也在这里重置
      setShowAdvanced(false)
    }
  }

  return (
    <form className="add-todo-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <div className="input-with-speech">
          <input
            type="text"
            className="todo-input"
            placeholder="输入待办事项标题..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <button
            type="button"
            className={`speech-btn ${isListening && speechMode === 'title' ? 'listening' : ''}`}
            onClick={() => {
              if (isListening && speechMode === 'title') {
                stopSpeechRecognition()
              } else {
                startSpeechRecognition('title')
              }
            }}
            disabled={!isSupportedRef.current}
            title={isSupportedRef.current ? '语音输入标题' : '浏览器不支持语音识别'}
          >
            {isListening && speechMode === 'title' ? '🎤' : '🎙️'}
          </button>
        </div>
      </div>
      {showDescription && (
        <div className="form-group">
          <div className="input-with-speech">
            <textarea
              className="todo-textarea"
              placeholder="输入描述（可选）..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            <button
              type="button"
              className={`speech-btn speech-btn-textarea ${isListening && speechMode === 'description' ? 'listening' : ''}`}
              onClick={() => {
                if (isListening && speechMode === 'description') {
                  stopSpeechRecognition()
                } else {
                  startSpeechRecognition('description')
                }
              }}
              disabled={!isSupportedRef.current}
              title={isSupportedRef.current ? '语音输入描述' : '浏览器不支持语音识别'}
            >
              {isListening && speechMode === 'description' ? '🎤' : '🎙️'}
            </button>
          </div>
        </div>
      )}
      {showAdvanced && (
        <div className="advanced-options">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">分类</label>
              <select
                className="todo-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as TodoCategory)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">优先级</label>
              <select
                className="todo-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TodoPriority)}
              >
                {priorities.map((pri) => (
                  <option key={pri} value={pri}>
                    {pri}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">截止日期</label>
              <input
                type="date"
                className="todo-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>
      )}
      {speechError && (
        <div className="speech-error">
          ⚠️ {speechError}
        </div>
      )}
      {isListening && (
        <div className="speech-status">
          <span className="speech-indicator"></span>
          {speechMode === 'title' ? '正在识别标题...' : '正在识别描述...'}
          <button
            type="button"
            className="speech-stop-btn"
            onClick={stopSpeechRecognition}
          >
            停止
          </button>
        </div>
      )}
      <div className="form-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setShowDescription(!showDescription)}
        >
          {showDescription ? '隐藏描述' : '添加描述'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? '隐藏选项' : '更多选项'}
        </button>
        <button type="submit" className="btn-primary" disabled={isListening}>
          添加待办
        </button>
      </div>
    </form>
  )
}

