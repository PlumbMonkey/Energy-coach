import { useTasks } from '../context/ScheduleContext'
import { blockColors, blockLabels } from '../lib/scheduleTasks'

export default function TodaySchedulePanel() {
  const { state, toggleTask, resetDay, firebaseReady } = useTasks()

  // Count done tasks
  const doneCount = state.tasks.filter((t) => t.status === 'done').length
  const totalCount = state.tasks.length
  const donePercent = Math.round((doneCount / totalCount) * 100)

  // Group tasks by block
  const tasksByBlock = {
    morning: state.tasks.filter((t) => t.block === 'morning'),
    build: state.tasks.filter((t) => t.block === 'build'),
    afternoon: state.tasks.filter((t) => t.block === 'afternoon'),
    weekly: state.tasks.filter((t) => t.block === 'weekly'),
  }

  return (
    <div className="space-y-4">
      {/* Firebase connection indicator */}
      {firebaseReady && (
        <div className="text-xs text-emerald-500 flex items-center gap-1 px-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Syncing with Firebase
        </div>
      )}

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-zinc-300">Today's Progress</span>
          <span className="text-sm text-zinc-500">
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
      <div className="space-y-4">
        {(['morning', 'build', 'afternoon', 'weekly'] as const).map((block) => {
          const tasks = tasksByBlock[block]
          if (tasks.length === 0) return null

          const blockColor = blockColors[block]
          const blockLabel = blockLabels[block]
          const blockDone = tasks.filter((t) => t.status === 'done').length

          return (
            <div key={block} className="space-y-2">
              {/* Block header */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
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
              <div className="space-y-1 ml-2">
                {tasks.map((task) => {
                  const isDone = task.status === 'done'
                  const isInProgress = task.status === 'in_progress'

                  return (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className="w-full flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-zinc-900/50 transition-colors text-left group"
                      title="Click to cycle: pending → in_progress → done"
                    >
                      {/* Checkbox indicator */}
                      <div
                        className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
                        style={{
                          borderColor: isInProgress ? blockColor : isDone ? '#10b981' : '#52525b',
                          backgroundColor: isDone ? '#10b981' : isInProgress ? blockColor : 'transparent',
                        }}
                      >
                        {isDone && <span className="text-white text-xs font-bold">✓</span>}
                        {isInProgress && !isDone && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>

                      {/* Task label and time */}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium transition-colors ${
                            isDone
                              ? 'text-zinc-500 line-through'
                              : isInProgress
                                ? 'text-white'
                                : 'text-zinc-300'
                          }`}
                        >
                          {task.label}
                        </p>
                        <p className="text-xs text-zinc-600 group-hover:text-zinc-500">
                          {task.estimatedMin} min
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Reset button */}
      <div className="pt-2 border-t border-zinc-800">
        <button
          onClick={resetDay}
          className="w-full px-3 py-2 text-sm font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 rounded-lg transition-colors border border-zinc-800 hover:border-zinc-700"
        >
          Reset Day
        </button>
      </div>
    </div>
  )
}
