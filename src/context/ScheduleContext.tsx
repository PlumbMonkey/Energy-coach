import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react'
import { type ScheduleTask, type TaskStatus, defaultTasks } from '../lib/scheduleTasks'
import { db, isConfigured, collection, doc, setDoc, onSnapshot } from '../lib/firebase'

interface ScheduleState {
  tasks: ScheduleTask[]
  lastResetDate: string // ISO date string
}

type ScheduleAction =
  | { type: 'SET_TASKS'; payload: ScheduleTask[] }
  | { type: 'TOGGLE_TASK'; payload: string } // task id
  | { type: 'RESET_DAY' }
  | { type: 'LOAD_FROM_STORAGE' }

const ScheduleContext = createContext<
  | {
      state: ScheduleState
      dispatch: React.Dispatch<ScheduleAction>
      toggleTask: (id: string) => void
      resetDay: () => void
      firebaseReady: boolean
    }
  | undefined
>(undefined)

const STORAGE_KEY = 'conductor_schedule_v1'
const FIRESTORE_DOC = 'tasks'
const FIRESTORE_COLLECTION = 'conductor'

function getNextStatus(current: TaskStatus): TaskStatus {
  if (current === 'pending') return 'in_progress'
  if (current === 'in_progress') return 'done'
  return 'pending'
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

function scheduleReducer(state: ScheduleState, action: ScheduleAction): ScheduleState {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload }

    case 'TOGGLE_TASK': {
      const updated = state.tasks.map((task) =>
        task.id === action.payload
          ? { ...task, status: getNextStatus(task.status) }
          : task
      )
      return { ...state, tasks: updated }
    }

    case 'RESET_DAY': {
      const today = getTodayDate()
      const reset = state.tasks.map((task) =>
        task.weeklyOnly
          ? task // keep weekly tasks as-is
          : { ...task, status: 'pending' as const }
      )
      return { ...state, tasks: reset, lastResetDate: today }
    }

    case 'LOAD_FROM_STORAGE': {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          return JSON.parse(stored) as ScheduleState
        } catch {
          return state
        }
      }
      return state
    }

    default:
      return state
  }
}

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const today = getTodayDate()

  const [state, dispatch] = useReducer(scheduleReducer, {
    tasks: defaultTasks,
    lastResetDate: today,
  })

  const [firebaseReady, setFirebaseReady] = React.useState(false)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    dispatch({ type: 'LOAD_FROM_STORAGE' })
  }, [])

  // Check if we need to auto-reset tasks (new day)
  useEffect(() => {
    if (state.lastResetDate !== today) {
      dispatch({ type: 'RESET_DAY' })
    }
  }, [today, state.lastResetDate])

  // Set up Firebase listener + sync to localStorage
  useEffect(() => {
    if (!isConfigured || !db) {
      setFirebaseReady(false)
      // Persist to localStorage only
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      return
    }

    try {
      // Subscribe to Firestore updates in real-time
      const docRef = doc(collection(db, FIRESTORE_COLLECTION), FIRESTORE_DOC)
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as ScheduleState
            dispatch({ type: 'SET_TASKS', payload: data.tasks })
            setFirebaseReady(true)
          } else {
            // Doc doesn't exist yet, will create it on first write
            setFirebaseReady(true)
          }
        },
        (error) => {
          console.warn('Firebase listener error:', error)
          setFirebaseReady(false)
        }
      )

      unsubscribeRef.current = unsubscribe

      return () => {
        unsubscribe()
      }
    } catch (err) {
      console.warn('Failed to set up Firebase listener:', err)
      setFirebaseReady(false)
    }
  }, [])

  // Persist to both Firestore and localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))

    if (isConfigured && db && firebaseReady) {
      try {
        const docRef = doc(collection(db, FIRESTORE_COLLECTION), FIRESTORE_DOC)
        void setDoc(docRef, state, { merge: true })
      } catch (err) {
        console.warn('Failed to write to Firestore:', err)
      }
    }
  }, [state, firebaseReady])

  const toggleTask = (id: string) => {
    dispatch({ type: 'TOGGLE_TASK', payload: id })
  }

  const resetDay = () => {
    if (confirm('Reset all tasks to pending? This cannot be undone.')) {
      dispatch({ type: 'RESET_DAY' })
    }
  }

  return (
    <ScheduleContext.Provider value={{ state, dispatch, toggleTask, resetDay, firebaseReady }}>
      {children}
    </ScheduleContext.Provider>
  )
}

export function useTasks() {
  const ctx = useContext(ScheduleContext)
  if (!ctx) {
    throw new Error('useTasks must be used within ScheduleProvider')
  }
  return ctx
}
