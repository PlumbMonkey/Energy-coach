import React, { useEffect, useReducer, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { ScheduleTask, TaskStatus, defaultTasks, blockColors, blockLabels } from '../src/lib/scheduleTasks'

interface PopupState {
  tasks: ScheduleTask[]
  lastResetDate: string
}

type PopupAction =
  | { type: 'LOAD_TASKS'; payload: PopupState }
  | { type: 'TOGGLE_TASK'; payload: string }

const STORAGE_KEY = 'conductor_schedule_v1'

function getNextStatus(current: TaskStatus): TaskStatus {
  if (current === 'pending') return 'in_progress'
  if (current === 'in_progress') return 'done'
  return 'pending'
}

function popupReducer(state: PopupState, action: PopupAction): PopupState {
  switch (action.type) {
    case 'LOAD_TASKS':
      return action.payload

    case 'TOGGLE_TASK': {
      const updated = state.tasks.map((task) =>
        task.id === action.payload
          ? { ...task, status: getNextStatus(task.status) }
          : task
      )
      const newState = { ...state, tasks: updated }
      // Sync back to extension storage
      chrome.storage.sync.set({ [STORAGE_KEY]: newState })
      return newState
    }

    default:
      return state
  }
}

function PopupSchedule() {
  const today = new Date().toISOString().split('T')[0]
  const [state, dispatch] = useReducer(popupReducer, {
    tasks: defaultTasks,
    lastResetDate: today,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load tasks from Chrome storage on mount
  useEffect(() => {
    chrome.storage.sync.get([STORAGE_KEY], (result) => {
      try {
        if (result[STORAGE_KEY]) {
          dispatch({ type: 'LOAD_TASKS', payload: result[STORAGE_KEY] })
        } else {
          dispatch({ type: 'LOAD_TASKS', payload: { tasks: defaultTasks, lastResetDate: today } })
        }
      } catch (err) {
        setError('Failed to load schedule')
        console.error(err)
      }
      setLoading(false)
    })
  }, [today])

  if (loading) {
    return <div className="text-center py-12 text-zinc-500">Loading schedule...</div>
  }

  if (error) {
    return <div className="text-red-400 text-sm px-4 py-3 bg-red-900/20 rounded-lg">{error}</div>
  }

  const doneCount = state.tasks.filter((t) => t.status === 'done').length
  const totalCount = state.tasks.length
  const donePercent = Math.round((doneCount / totalCount) * 100)

  const tasksByBlock = {
    morning: state.tasks.filter((t) => t.block === 'morning'),
    build: state.tasks.filter((t) => t.block === 'build'),
    afternoon: state.tasks.filter((t) => t.block === 'afternoon'),
    weekly: state.tasks.filter((t) => t.block === 'weekly'),
  }

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-sm font-semibold text-zinc-300">Today's Progress</h1>
          <span className="text-xs text-zinc-500">
            {doneCount} of {totalCount}
          </span>
        </div>
        <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
            style={{ width: `${donePercent}%` }}
          />
        </div>
        <p className="text-xs text-zinc-500 mt-1">{donePercent}% complete</p>
      </div>

      {/* Task Groups */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {(['morning', 'build', 'afternoon', 'weekly'] as const).map((block) => {
          const tasks = tasksByBlock[block]
          if (tasks.length === 0) return null

          const blockColor = blockColors[block]
          const blockLabel = blockLabels[block]
          const blockDone = tasks.filter((t) => t.status === 'done').length

          return (
            <div key={block} className="space-y-1">
              {/* Block header */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: blockColor }}
                  />
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: blockColor }}
                  >
                    {blockLabel}
                  </span>
                </div>
                <span className="text-xs text-zinc-500">
                  {blockDone}/{tasks.length}
                </span>
              </div>

              {/* Tasks in block */}
              <div className="space-y-0.5 ml-2">
                {tasks.map((task) => {
                  const isDone = task.status === 'done'
                  const isInProgress = task.status === 'in_progress'

                  return (
                    <button
                      key={task.id}
                      onClick={() => dispatch({ type: 'TOGGLE_TASK', payload: task.id })}
                      className="w-full flex items-start gap-2 px-2 py-1.5 rounded hover:bg-zinc-900/50 transition-colors text-left text-xs"
                      title="Click to cycle: pending → in_progress → done"
                    >
                      {/* Checkbox */}
                      <div
                        className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          borderColor: isInProgress ? blockColor : isDone ? '#10b981' : '#52525b',
                          backgroundColor: isDone ? '#10b981' : isInProgress ? blockColor : 'transparent',
                        }}
                      >
                        {isDone && <span className="text-white text-xs">✓</span>}
                        {isInProgress && !isDone && (
                          <span className="w-1 h-1 rounded-full bg-white" />
                        )}
                      </div>

                      {/* Label */}
                      <p
                        className={`flex-1 font-medium transition-colors ${
                          isDone
                            ? 'text-zinc-500 line-through'
                            : isInProgress
                              ? 'text-white'
                              : 'text-zinc-300'
                        }`}
                      >
                        {task.label}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer link */}
      <div className="pt-3 border-t border-zinc-800 text-center">
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Open full app →
        </a>
      </div>
    </div>
  )
}

// Mount React app
const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<PopupSchedule />)
