// src/App.tsx — responsive, with Tasks + Pantry + Sleep

import { useEffect, useMemo, useState } from 'react'
import { pickQuote } from './lib/quotes'
import { addMinutes, fromHHMM, hhmm, toISO, todayISO, fmtDelta } from './lib/time'
import { ensurePermission, nativeNotify, beep } from './lib/notify'
import { pickRecipe, formatRecipeNote, recipesFor } from './lib/recipes'
import { planForDate, planNote } from './lib/exercise'
import { listTodayEvents, type GEvent } from './lib/google'
import { defaultSleep, minutesSlept, fmtHhMm, type SleepEntry } from './lib/sleep'
import {
  loadPantry, savePantry, updateItem as pantryUpdateItem,
  getAvailableTags, getShoppingList, cycleStatus, formatShoppingList,
  type PantryItem, type PantryCategory,
} from './lib/pantry'

type QuoteAuthor = 'Bruce Lee' | 'Alan Watts'
type Meal = 'breakfast' | 'lunch' | 'dinner'
type CardKey = Meal | 'exercise'
type AgendaNoteKey = 'breakfastNote' | 'lunchNote' | 'dinnerNote' | 'exerciseNote'

type Agenda = {
  dateISO: string
  checkinISO?: string
  breakfastISO?: string
  lunchISO?: string
  dinnerISO?: string
  exerciseISO?: string
  breakfastNote?: string
  lunchNote?: string
  dinnerNote?: string
  exerciseNote?: string
  quote?: { text: string, author: QuoteAuthor }
}

type Settings = {
  breakfastOffsetMins: number
  mealIntervalHours: number
  exerciseDefault?: 'morning' | 'evening' | 'custom'
  exerciseOffsetMins?: number
  quotePref: 'bruce' | 'alan' | 'both'
  notify: { meals: boolean; exercise: boolean; quotes: boolean; sound: boolean }
  bookingUrl?: string
}

// ---- localStorage helper (lint-clean)
const LS = {
  get<T>(k: string, fallback: T): T {
    try {
      const v = localStorage.getItem(k)
      return v ? (JSON.parse(v) as T) : fallback
    } catch {
      return fallback
    }
  },
  set<T>(k: string, v: T) {
    try {
      localStorage.setItem(k, JSON.stringify(v))
    } catch {
      // ignore quota / private mode
    }
  },
}

const DEFAULT_SETTINGS: Settings = {
  breakfastOffsetMins: 60,
  mealIntervalHours: 4,
  exerciseDefault: 'evening',
  exerciseOffsetMins: 60,
  quotePref: 'both',
  notify: { meals: true, exercise: true, quotes: true, sound: true },
}

type CardItem = { key: CardKey; label: string; iso: string; noteKey: AgendaNoteKey }

export default function App() {
  const [settings, setSettings] = useState<Settings>(() => LS.get('ec_settings', DEFAULT_SETTINGS))
  const [agenda, setAgenda] = useState<Agenda>(() => LS.get('ec_agenda', { dateISO: todayISO() }))
  const [tasks, setTasks] = useState<GEvent[]>([])
  const [pantry, setPantry] = useState<PantryItem[]>(() => loadPantry())
  const [pantryOpen, setPantryOpen] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches
  )
  const [sleep, setSleep] = useState<SleepEntry>(() => {
    const day = (LS.get<Agenda>('ec_agenda', { dateISO: todayISO() }).dateISO).slice(0, 10)
    return LS.get<SleepEntry | null>('ec_sleep_' + day, null) ?? defaultSleep(day + 'T00:00:00.000Z')
  })

  // persist
  useEffect(() => { LS.set('ec_settings', settings) }, [settings])
  useEffect(() => { LS.set('ec_agenda', agenda) }, [agenda])
  useEffect(() => { savePantry(pantry) }, [pantry])
  useEffect(() => {
    const key = 'ec_sleep_' + agenda.dateISO.slice(0, 10)
    LS.set(key, sleep)
  }, [sleep, agenda.dateISO])

  // reset if calendar day rolled
  useEffect(() => {
    const today = todayISO()
    if (agenda.dateISO !== today) {
      setAgenda({ dateISO: today })
      const key = 'ec_sleep_' + today.slice(0, 10)
      setSleep(LS.get<SleepEntry | null>(key, null) ?? defaultSleep(today))
    }
  }, [agenda.dateISO])

  // permissions once
  useEffect(() => { void ensurePermission() }, [])

  // ----- helpers to auto-fill notes -----
  function suggestMeals(dateISO: string, pantryItems = pantry) {
    const tags = getAvailableTags(pantryItems)
    const b = formatRecipeNote(pickRecipe('breakfast', dateISO, tags))
    const l = formatRecipeNote(pickRecipe('lunch', dateISO, tags))
    const d = formatRecipeNote(pickRecipe('dinner', dateISO, tags))
    setAgenda(a => ({ ...a, breakfastNote: b, lunchNote: l, dinnerNote: d }))
  }

  function togglePantryItem(id: string) {
    setPantry(prev => {
      const item = prev.find(i => i.id === id)
      if (!item) return prev
      return pantryUpdateItem(prev, id, cycleStatus(item.status))
    })
  }

  function clearBought() {
    setPantry(prev =>
      prev.map(item => item.status === 'out' ? { ...item, status: 'full', updatedAt: new Date().toISOString() } : item)
    )
  }

  function shareShoppingList() {
    const text = formatShoppingList(pantry)
    void navigator.clipboard.writeText(text)
  }
  function suggestExercise(dateISO: string) {
    const p = planForDate(dateISO)
    setAgenda(a => ({ ...a, exerciseNote: planNote(p) }))
  }

  // backfill if user checked in but notes are empty
  useEffect(() => {
    if (!agenda.checkinISO) return
    const needsMeals = !agenda.breakfastNote || !agenda.lunchNote || !agenda.dinnerNote
    const needsEx = !agenda.exerciseNote
    if (needsMeals) suggestMeals(agenda.dateISO)
    if (needsEx) suggestExercise(agenda.dateISO)
  }, [
    agenda.checkinISO,
    agenda.dateISO,
    agenda.breakfastNote,
    agenda.lunchNote,
    agenda.dinnerNote,
    agenda.exerciseNote,
  ])

  // cards in time order
  const cards = useMemo<CardItem[]>(() => {
    const items: CardItem[] = []
    if (agenda.breakfastISO) items.push({ key: 'breakfast', label: 'Breakfast', iso: agenda.breakfastISO, noteKey: 'breakfastNote' })
    if (agenda.lunchISO) items.push({ key: 'lunch', label: 'Lunch', iso: agenda.lunchISO, noteKey: 'lunchNote' })
    if (agenda.dinnerISO) items.push({ key: 'dinner', label: 'Dinner', iso: agenda.dinnerISO, noteKey: 'dinnerNote' })
    if (agenda.exerciseISO) items.push({ key: 'exercise', label: 'Exercise', iso: agenda.exerciseISO, noteKey: 'exerciseNote' })
    return items.sort((a, b) => new Date(a.iso).getTime() - new Date(b.iso).getTime())
  }, [agenda.breakfastISO, agenda.lunchISO, agenda.dinnerISO, agenda.exerciseISO])

  function checkInNow() {
    const nowISO = toISO(new Date())
    const breakfastISO = addMinutes(nowISO, settings.breakfastOffsetMins)
    const lunchISO = addMinutes(breakfastISO, settings.mealIntervalHours * 60)
    const dinnerISO = addMinutes(lunchISO, settings.mealIntervalHours * 60)
    let exerciseISO: string | undefined
    if (settings.exerciseDefault === 'morning') exerciseISO = addMinutes(breakfastISO, -30)
    else if (settings.exerciseDefault === 'evening') exerciseISO = addMinutes(dinnerISO, settings.exerciseOffsetMins ?? 60)

    // Get quote and author together
    const quoteObj = pickQuote(settings.quotePref)

    const next: Agenda = {
      dateISO: todayISO(),
      checkinISO: nowISO,
      breakfastISO, lunchISO, dinnerISO, exerciseISO,
      quote: quoteObj,
    }

    setAgenda(next)
    suggestMeals(next.dateISO)
    suggestExercise(next.dateISO)

    if (settings.notify.quotes) {
      void nativeNotify({ title: 'Daily Inspiration', body: `${quoteObj.text} — ${quoteObj.author}` })
    }

    scheduleDayNotifications({
      ...next,
      breakfastNote: pickRecipe('breakfast', next.dateISO, getAvailableTags(pantry)).title,
      lunchNote: pickRecipe('lunch', next.dateISO, getAvailableTags(pantry)).title,
      dinnerNote: pickRecipe('dinner', next.dateISO, getAvailableTags(pantry)).title,
      exerciseNote: planForDate(next.dateISO).title,
    })
  }

  function scheduleDayNotifications(a: Agenda) {
    const now = Date.now()
    const push = (title: string, body: string, atISO?: string) => {
      if (!atISO) return
      const t = new Date(atISO).getTime()
      const delay = Math.max(0, t - now)
      setTimeout(() => {
        if (settings.notify.sound) beep()
        void nativeNotify({ title, body })
      }, delay)
    }
    if (settings.notify.meals) {
      push('Breakfast', a.breakfastNote ?? 'Breakfast time', a.breakfastISO)
      push('Lunch', a.lunchNote ?? 'Lunch time', a.lunchISO)
      push('Dinner', a.dinnerNote ?? 'Dinner time', a.dinnerISO)
    }
    if (settings.notify.exercise) push('Time to Move', a.exerciseNote ?? 'Exercise session', a.exerciseISO)
  }

  // one-off reminder without changing the schedule
  // (nudge function removed as it was unused)

  function editTime(kind: CardKey, hhmmStr: string, shiftDownstream: boolean) {
    if (!agenda.checkinISO) return
    const base = agenda.checkinISO
    const iso = fromHHMM(hhmmStr, base)
    const next: Agenda = { ...agenda }
    if (kind === 'breakfast') {
      next.breakfastISO = iso
      if (shiftDownstream) {
        next.lunchISO = addMinutes(iso, settings.mealIntervalHours * 60)
        next.dinnerISO = next.lunchISO ? addMinutes(next.lunchISO, settings.mealIntervalHours * 60) : next.dinnerISO
      }
    } else if (kind === 'lunch') {
      next.lunchISO = iso
      if (shiftDownstream) next.dinnerISO = addMinutes(iso, settings.mealIntervalHours * 60)
    } else if (kind === 'dinner') {
      next.dinnerISO = iso
    } else if (kind === 'exercise') {
      next.exerciseISO = iso
    }
    setAgenda(next)
    scheduleDayNotifications(next)
  }

  function editNote(key: AgendaNoteKey, v: string) {
    setAgenda({ ...agenda, [key]: v })
  }


  async function refreshTasks() {
    try {
      setTasks(await listTodayEvents())
    } catch (err) {
      if (import.meta.env.DEV) console.warn('Calendar load failed', err)
      setTasks([])
    }
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden p-6 bg-gradient-to-br from-zinc-900 via-slate-900 to-black">
      <header className="max-w-3xl mx-auto flex flex-col gap-2 mb-6 items-center text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">EnergyCoach</h1>
        <p className="text-sm text-zinc-300">
          Daily agenda with meal & exercise reminders. Local-first. PWA-ready. Capacitor-friendly.
        </p>
      </header>

      {/* Centered Check In and Enable buttons */}
      <div className="flex justify-center gap-2 mb-4">
        <button
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow"
          onClick={checkInNow}
        >
          Check In
        </button>
        <button
          className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-800 text-white font-semibold shadow"
          onClick={() => void ensurePermission()}
        >
          Enable Notifications
        </button>
      </div>

      {/* Centered quote section */}
      {agenda.quote && (
        <section className="max-w-3xl mx-auto mb-6 text-center">
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900 p-5 shadow-xl">
            <p className="text-xl leading-snug italic">“{agenda.quote.text}”</p>
            <p className="text-sm text-zinc-400 mt-1">— {agenda.quote.author}</p>
          </div>
        </section>
      )}

      {/* Center everything below the quote */}
      <section className="max-w-3xl mx-auto grid gap-4 items-center justify-center">
        {cards.map((c) => {
          return (
            <div
              key={c.key}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 mx-auto text-center w-full"
            >
              <div className="flex flex-col items-center gap-3">
                {/* text side can shrink/wrap */}
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold break-words">{c.label}</h3>
                  <p className="text-sm text-zinc-400 break-words">
                    {hhmm(c.iso)} today <span className="text-zinc-500">({fmtDelta(c.iso)})</span>
                  </p>
                </div>
                {/* controls */}
                <div className="flex items-center gap-2 shrink-0 justify-center">
                  <input
                    className="w-[110px] sm:w-auto px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
                    type="time"
                    value={hhmm(c.iso)}
                    onChange={(e) => editTime(c.key, e.target.value, c.key === 'breakfast' || c.key === 'lunch')}
                    title="Edit time (Breakfast/Lunch shift downstream)"
                  />
                  {c.key !== 'exercise' ? (
                    <button
                      className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs"
                      onClick={() =>
                        setAgenda(a => ({
                          ...a,
                          [c.noteKey]: formatRecipeNote(
                            (() => {
                              const pool = recipesFor(c.key as Meal)
                              const idx = Math.floor((Date.now() / 1000) % pool.length)
                              return pool[idx]
                            })()
                          ),
                        }))
                      }
                    >
                      Suggest
                    </button>
                  ) : (
                    <button
                      className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs"
                      onClick={() => suggestExercise(agenda.dateISO)}
                    >
                      Plan
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-3">
                <textarea
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 min-h-[90px]"
                  placeholder={c.key === 'exercise' ? 'Workout details (e.g., 30 min yoga)' : `What’s for ${c.label.toLowerCase()}?`}
                  value={agenda[c.noteKey] ?? ''}
                  onChange={(e) => editNote(c.noteKey, e.target.value)}
                />
              </div>
            </div>
          )
        })}

        {/* Tasks (Google Calendar) */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 mx-auto text-center w-full">
          <div className="flex flex-col items-center gap-3">
            <h3 className="text-lg font-semibold min-w-0 break-words">Today’s Tasks (Google Calendar)</h3>
            <div className="flex gap-2 shrink-0 justify-center">
              <button onClick={refreshTasks} className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-sm">Refresh</button>
              {settings.bookingUrl && (
                <a href={settings.bookingUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-sm">
                  Open Booking
                </a>
              )}
            </div>
          </div>
          <ul className="mt-3 space-y-2">
            {tasks.length === 0 && <li className="text-sm text-zinc-400">Connect & refresh to load today’s events.</li>}
            {tasks.map(ev => (
              <li key={ev.id} className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="min-w-0 text-center sm:text-left">
                  <p className="font-medium break-words">{ev.summary}</p>
                  <p className="text-xs text-zinc-400">
                    {new Date(ev.startISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {ev.endISO ? ` – ${new Date(ev.endISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                  </p>
                  {ev.location && <p className="text-xs text-zinc-500 break-words">{ev.location}</p>}
                </div>
                {ev.htmlLink && (
                  <a className="text-xs text-emerald-400 hover:underline shrink-0" href={ev.htmlLink} target="_blank" rel="noreferrer">
                    open
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Pantry & Shopping List */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 mx-auto w-full overflow-hidden">
          {/* Collapsible header */}
          <button
            className="w-full flex items-center justify-between px-5 py-4 text-left"
            onClick={() => setPantryOpen(o => !o)}
          >
            <span className="text-lg font-semibold">Pantry &amp; Shopping List</span>
            <span className="text-zinc-400 text-sm">{pantryOpen ? '▲ collapse' : '▼ expand'}</span>
          </button>

          {pantryOpen && (
            <div className="px-5 pb-5">
              {/* Items grouped by category */}
              {(['protein', 'produce', 'pantry', 'dairy', 'frozen', 'drinks'] as PantryCategory[]).map(cat => {
                const catItems = pantry.filter(i => i.category === cat)
                if (catItems.length === 0) return null
                return (
                  <div key={cat} className="mb-4">
                    <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2 capitalize">{cat}</p>
                    <div className="flex flex-col gap-1">
                      {catItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between gap-3">
                          <span className="text-sm text-zinc-200 min-w-0 break-words">{item.name}</span>
                          <button
                            className={[
                              'shrink-0 min-h-[44px] min-w-[72px] rounded-lg text-sm font-semibold border px-3',
                              item.status === 'full' ? 'bg-emerald-700 border-emerald-600 text-white' :
                              item.status === 'low'  ? 'bg-amber-600 border-amber-500 text-white' :
                                                      'bg-red-700 border-red-600 text-white'
                            ].join(' ')}
                            onClick={() => togglePantryItem(item.id)}
                          >
                            {item.status.toUpperCase()}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              {/* Shopping List */}
              <div className="border-t border-zinc-800 pt-4 mt-2">
                <p className="text-sm font-semibold text-zinc-300 mb-2">Shopping List</p>
                {getShoppingList(pantry).length === 0 ? (
                  <p className="text-sm text-zinc-400">Pantry is fully stocked!</p>
                ) : (
                  <ul className="space-y-1 mb-3">
                    {getShoppingList(pantry).map(item => (
                      <li key={item.id} className="flex items-center justify-between gap-2">
                        <span
                          className={`text-base font-medium ${
                            item.status === 'out' ? 'text-red-400' : 'text-amber-400'
                          }`}
                        >
                          {item.name}
                        </span>
                        <span className="text-xs text-zinc-500">{item.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex gap-2 flex-wrap">
                  <button
                    className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold"
                    onClick={clearBought}
                  >
                    Clear Bought
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold"
                    onClick={shareShoppingList}
                  >
                    Share List
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sleep Health */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 mx-auto text-center w-full">
          <h3 className="text-lg font-semibold mb-2">Sleep Health</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="text-sm text-zinc-300 flex items-center justify-between gap-2">
              Bedtime
              <input
                type="time"
                className="w-32 px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800"
                value={sleep.bedISO ? new Date(sleep.bedISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                onChange={(e) => {
                  const [h, m] = e.target.value.split(':').map(Number)
                  const d = new Date(); d.setHours(h, m, 0, 0)
                  setSleep(s => ({ ...s, bedISO: d.toISOString() }))
                }}
              />
            </label>
            <label className="text-sm text-zinc-300 flex items-center justify-between gap-2">
              Wake
              <input
                type="time"
                className="w-32 px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800"
                value={sleep.wakeISO ? new Date(sleep.wakeISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                onChange={(e) => {
                  const [h, m] = e.target.value.split(':').map(Number)
                  const d = new Date(); d.setHours(h, m, 0, 0)
                  setSleep(s => ({ ...s, wakeISO: d.toISOString() }))
                }}
              />
            </label>
            <label className="text-sm text-zinc-300 flex items-center justify-between gap-2 col-span-full">
              Quality (1–10)
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                className="w-64"
                value={sleep.quality ?? 7}
                onChange={(e) => setSleep(s => ({ ...s, quality: Number(e.target.value) }))}
              />
              <span className="text-xs text-zinc-400">{sleep.quality ?? 7}</span>
            </label>
            <div className="col-span-full">
              <textarea
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 min-h-[90px]"
                placeholder="Dream notes (on waking)"
                value={sleep.dream ?? ''}
                onChange={(e) => setSleep(s => ({ ...s, dream: e.target.value }))}
              />
              <p className="text-xs text-zinc-500 mt-1">Slept: {fmtHhMm(minutesSlept(sleep))}</p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 mx-auto text-center w-full">
          <h3 className="text-lg font-semibold mb-2">Settings</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="text-sm text-zinc-300 flex items-center justify-between gap-2">Breakfast offset (mins)
              <input
                type="number"
                className="w-28 px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800"
                value={settings.breakfastOffsetMins}
                onChange={(e) => setSettings({ ...settings, breakfastOffsetMins: Number(e.target.value) })}
              />
            </label>
            <label className="text-sm text-zinc-300 flex items-center justify-between gap-2">Meal interval (hours)
              <input
                type="number"
                className="w-28 px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800"
                value={settings.mealIntervalHours}
                onChange={(e) => setSettings({ ...settings, mealIntervalHours: Number(e.target.value) })}
              />
            </label>
            <label className="text-sm text-zinc-300 flex items-center justify-between gap-2">Exercise default
              <select
                className="w-36 px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800"
                value={settings.exerciseDefault}
                onChange={(e) => setSettings({ ...settings, exerciseDefault: e.target.value as Settings['exerciseDefault'] })}
              >
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="custom">Custom (edit card)</option>
              </select>
            </label>
            <label className="text-sm text-zinc-300 flex items-center justify-between gap-2">Evening exercise offset (mins)
              <input
                type="number"
                className="w-28 px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800"
                value={settings.exerciseOffsetMins}
                onChange={(e) => setSettings({ ...settings, exerciseOffsetMins: Number(e.target.value) })}
              />
            </label>
            <label className="text-sm text-zinc-300 flex items-center justify-between gap-2">Quote source
              <select
                className="w-36 px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800"
                value={settings.quotePref}
                onChange={(e) => setSettings({ ...settings, quotePref: e.target.value as Settings['quotePref'] })}
              >
                <option value="both">Both</option>
                <option value="bruce">Bruce Lee</option>
                <option value="alan">Alan Watts</option>
              </select>
            </label>
            <label className="text-sm text-zinc-300 flex items-center justify-between gap-2 col-span-full">Booking URL
              <input
                type="url"
                placeholder="https://cal.com/you/... or Google appointment link"
                className="w-full px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800"
                value={settings.bookingUrl ?? ''}
                onChange={(e) => setSettings({ ...settings, bookingUrl: e.target.value })}
              />
            </label>
            <div className="text-sm text-zinc-300 col-span-full">
              <p className="mb-1">Notifications</p>
              <div className="flex flex-wrap gap-3">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.notify.meals}
                    onChange={(e) => setSettings({ ...settings, notify: { ...settings.notify, meals: e.target.checked } })}
                  /> Meals
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.notify.exercise}
                    onChange={(e) => setSettings({ ...settings, notify: { ...settings.notify, exercise: e.target.checked } })}
                  /> Exercise
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.notify.quotes}
                    onChange={(e) => setSettings({ ...settings, notify: { ...settings.notify, quotes: e.target.checked } })}
                  /> Quotes
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.notify.sound}
                    onChange={(e) => setSettings({ ...settings, notify: { ...settings.notify, sound: e.target.checked } })}
                  /> Sound
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="max-w-3xl mx-auto mt-8 text-xs text-zinc-500">
        <p>Local-first. To sync across devices, add Firebase later (Auth + Firestore) and mirror this agenda structure in the cloud.</p>
      </footer>
    </div>
  )
}


