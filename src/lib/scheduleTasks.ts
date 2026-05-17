export type TimeBlock = 'morning' | 'build' | 'afternoon' | 'weekly';
export type TaskStatus = 'pending' | 'in_progress' | 'done';

export interface ScheduleTask {
  id: string;
  block: TimeBlock;
  label: string;
  estimatedMin: string; // e.g. "30–45"
  weeklyOnly: boolean; // true = only appears once per week
  status: TaskStatus;
}

export const defaultTasks: ScheduleTask[] = [
  {
    id: 'chinese',
    block: 'morning',
    label: 'Chinese language lesson',
    estimatedMin: '20–30',
    weeklyOnly: false,
    status: 'pending',
  },
  {
    id: 'fcc',
    block: 'morning',
    label: 'FreeCodeCamp JS — 1 lesson',
    estimatedMin: '30–45',
    weeklyOnly: false,
    status: 'pending',
  },
  {
    id: 'blender-arc',
    block: 'morning',
    label: 'Blender Architecture — 1 lesson',
    estimatedMin: '30–45',
    weeklyOnly: false,
    status: 'pending',
  },
  {
    id: 'build',
    block: 'build',
    label: 'App coding session (Path build)',
    estimatedMin: '120–180',
    weeklyOnly: false,
    status: 'pending',
  },
  {
    id: 'blender-phy',
    block: 'afternoon',
    label: 'Blender Physics — 1 lesson',
    estimatedMin: '30–45',
    weeklyOnly: false,
    status: 'pending',
  },
  {
    id: 'grease',
    block: 'afternoon',
    label: 'Grease Pencil — 1 lesson',
    estimatedMin: '30–45',
    weeklyOnly: false,
    status: 'pending',
  },
  {
    id: 'music-sess',
    block: 'weekly',
    label: 'Music session (1x/week)',
    estimatedMin: '120–180',
    weeklyOnly: true,
    status: 'pending',
  },
  {
    id: 'gaming-vid',
    block: 'weekly',
    label: 'Gaming video (1x/week)',
    estimatedMin: '60–120',
    weeklyOnly: true,
    status: 'pending',
  },
  {
    id: 'drawing-vid',
    block: 'weekly',
    label: 'Drawing/3D video (1x/week)',
    estimatedMin: '60–120',
    weeklyOnly: true,
    status: 'pending',
  },
  {
    id: 'vid-edit',
    block: 'weekly',
    label: 'Video edit + thumbnail',
    estimatedMin: '30–60',
    weeklyOnly: true,
    status: 'pending',
  },
  {
    id: 'review',
    block: 'weekly',
    label: 'Weekly checklist review',
    estimatedMin: '20–30',
    weeklyOnly: true,
    status: 'pending',
  },
];

export const blockColors = {
  morning: '#06b6d4', // cyan-600
  build: '#eab308', // yellow-500
  afternoon: '#a855f7', // violet-500
  weekly: '#f97316', // orange-500
} as const;

export const blockLabels: Record<TimeBlock, string> = {
  morning: 'MORNING',
  build: 'BUILD',
  afternoon: 'ARVO',
  weekly: 'WEEKLY',
} as const;
