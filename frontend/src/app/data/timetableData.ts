import type { CourseSlot } from '../types/types';

export type TimetableDay = '월' | '화' | '수' | '목' | '금';
export type TimetablePlanKey = 'A' | 'B' | 'C';
export type TimetablePlanSelections = Record<TimetablePlanKey, string[]>;
export type TimetablePlanThemeAssignments = Record<TimetablePlanKey, Record<string, number>>;

export type TimetableSlot = CourseSlot;

export const TIMETABLE_CART_STORAGE_KEY = 'timetable_cart_courses';
export const TIMETABLE_SELECTED_STORAGE_KEY = 'timetable_selected_courses';
export const TIMETABLE_SEEDED_STORAGE_KEY = 'timetable_seeded_v3';
export const TIMETABLE_ACTIVE_PLAN_STORAGE_KEY = 'timetable_active_plan_v1';
export const TIMETABLE_PLAN_SELECTIONS_STORAGE_KEY = 'timetable_plan_selections_v1';
export const TIMETABLE_PLAN_THEME_ASSIGNMENTS_STORAGE_KEY = 'timetable_plan_theme_assignments_v1';

export const TIMETABLE_DAYS: TimetableDay[] = ['월', '화', '수', '목', '금'];
export const TIMETABLE_PLAN_KEYS: TimetablePlanKey[] = ['A', 'B', 'C'];

export const PERIODS = [
  { period: 1, label: '1교시', time: '09:00' },
  { period: 2, label: '2교시', time: '09:30' },
  { period: 3, label: '3교시', time: '10:00' },
  { period: 4, label: '4교시', time: '10:30' },
  { period: 5, label: '5교시', time: '11:00' },
  { period: 6, label: '6교시', time: '11:30' },
  { period: 7, label: '7교시', time: '12:00' },
  { period: 8, label: '8교시', time: '12:30' },
  { period: 9, label: '9교시', time: '13:00' },
  { period: 10, label: '10교시', time: '13:30' },
  { period: 11, label: '11교시', time: '14:00' },
  { period: 12, label: '12교시', time: '14:30' },
  { period: 13, label: '13교시', time: '15:00' },
  { period: 14, label: '14교시', time: '15:30' },
];

const PERIOD_START_HOUR = 9;
const PERIOD_MINUTE_STEP = 30;

const padTime = (value: number) => String(value).padStart(2, '0');

export const getPeriodStartMinutes = (period: number) =>
  PERIOD_START_HOUR * 60 + (period - 1) * PERIOD_MINUTE_STEP;

export const formatMinutesAsTime = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${padTime(hours)}:${padTime(minutes)}`;
};

export const formatPeriodTime = (period: number) =>
  formatMinutesAsTime(getPeriodStartMinutes(period));

export const formatPeriodRange = (startPeriod: number, endPeriod: number) => {
  const start = getPeriodStartMinutes(startPeriod);
  const end = getPeriodStartMinutes(endPeriod) + PERIOD_MINUTE_STEP;
  return `${formatMinutesAsTime(start)}-${formatMinutesAsTime(end)}`;
};

export const TIMETABLE_BY_COURSE_ID: Record<string, TimetableSlot[]> = {
  '1': [
    { day: '월', startPeriod: 2, endPeriod: 3, location: '5호관 301' },
    { day: '수', startPeriod: 2, endPeriod: 3, location: '5호관 301' },
  ],
  '3': [
    { day: '화', startPeriod: 4, endPeriod: 5, location: '2호관 201' },
    { day: '목', startPeriod: 4, endPeriod: 5, location: '2호관 201' },
  ],
  '6': [
    { day: '월', startPeriod: 5, endPeriod: 6, location: '정보전산원 101' },
    { day: '수', startPeriod: 5, endPeriod: 6, location: '정보전산원 101' },
  ],
  '7': [
    { day: '월', startPeriod: 2, endPeriod: 3, location: '6호관 201' },
    { day: '수', startPeriod: 2, endPeriod: 3, location: '6호관 201' },
  ],
  '8': [
    { day: '화', startPeriod: 2, endPeriod: 3, location: '4호관 402' },
    { day: '목', startPeriod: 2, endPeriod: 3, location: '4호관 402' },
  ],
  '9': [
    { day: '화', startPeriod: 6, endPeriod: 7, location: '2호관 204' },
    { day: '목', startPeriod: 6, endPeriod: 7, location: '2호관 204' },
  ],
  '101': [
    { day: '월', startPeriod: 1, endPeriod: 2, location: '하이테크 103' },
    { day: '수', startPeriod: 1, endPeriod: 2, location: '하이테크 103' },
  ],
  '202': [{ day: '금', startPeriod: 2, endPeriod: 4, location: '인문관 110' }],
  '206': [{ day: '금', startPeriod: 6, endPeriod: 8, location: '60주년기념관 209' }],
  '2': [
    { day: '월', startPeriod: 8, endPeriod: 9, location: '정보통신관 402' },
    { day: '수', startPeriod: 8, endPeriod: 9, location: '정보통신관 402' },
  ],
  '4': [
    { day: '화', startPeriod: 9, endPeriod: 10, location: '하이테크 401' },
    { day: '목', startPeriod: 9, endPeriod: 10, location: '하이테크 401' },
  ],
  '5': [
    { day: '월', startPeriod: 11, endPeriod: 12, location: '정보통신관 301' },
    { day: '수', startPeriod: 11, endPeriod: 12, location: '정보통신관 301' },
  ],
  '201': [{ day: '화', startPeriod: 1, endPeriod: 2, location: '인문관 208' }],
  '203': [{ day: '수', startPeriod: 4, endPeriod: 5, location: '5호관 102' }],
  '204': [{ day: '목', startPeriod: 11, endPeriod: 12, location: '법학관 204' }],
  '205': [{ day: '금', startPeriod: 5, endPeriod: 6, location: '서호관 118' }],
  '301': [{ day: '화', startPeriod: 7, endPeriod: 8, location: '인문관 203' }],
  '302': [{ day: '금', startPeriod: 12, endPeriod: 14, location: '60주년기념관 318' }],
  '303': [
    { day: '월', startPeriod: 3, endPeriod: 4, location: '정보전산원 404' },
    { day: '수', startPeriod: 3, endPeriod: 4, location: '정보전산원 404' },
  ],
  '304': [{ day: '화', startPeriod: 10, endPeriod: 12, location: '하이테크 209' }],
  '305': [
    { day: '목', startPeriod: 5, endPeriod: 7, location: '5호관 410' },
  ],
  '306': [
    { day: '월', startPeriod: 13, endPeriod: 14, location: '서호관 307' },
    { day: '수', startPeriod: 13, endPeriod: 14, location: '서호관 307' },
  ],
};

export const TIMETABLE_STARTER_CART_IDS = [
  '101',
  '1',
  '8',
  '3',
  '4',
  '5',
  '201',
  '202',
  '203',
  '204',
  '205',
  '206',
  '303',
  '304',
  '305',
  '306',
];

export const TIMETABLE_STARTER_SELECTED_IDS = [
  '101',
  '201',
  '303',
  '3',
  '202',
  '205',
  '4',
  '306',
];

const loadIds = (key: string) => {
  if (typeof window === 'undefined') {
    return [] as string[];
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveIds = (key: string, ids: string[]) => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(key, JSON.stringify(ids));
};

export const loadTimetableCartIds = () => loadIds(TIMETABLE_CART_STORAGE_KEY);
export const saveTimetableCartIds = (ids: string[]) => saveIds(TIMETABLE_CART_STORAGE_KEY, ids);

export const loadSelectedTimetableIds = () => loadIds(TIMETABLE_SELECTED_STORAGE_KEY);
export const saveSelectedTimetableIds = (ids: string[]) =>
  saveIds(TIMETABLE_SELECTED_STORAGE_KEY, ids);

const createEmptyPlanSelections = (): TimetablePlanSelections => ({
  A: [],
  B: [],
  C: [],
});

const createEmptyPlanThemeAssignments = (): TimetablePlanThemeAssignments => ({
  A: {},
  B: {},
  C: {},
});

const loadObject = <T>(key: string, fallback: T) => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const saveObject = <T>(key: string, value: T) => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
};

export const loadActiveTimetablePlanKey = (): TimetablePlanKey => {
  if (typeof window === 'undefined') {
    return 'A';
  }

  const raw = localStorage.getItem(TIMETABLE_ACTIVE_PLAN_STORAGE_KEY);
  return raw === 'B' || raw === 'C' ? raw : 'A';
};

export const saveActiveTimetablePlanKey = (planKey: TimetablePlanKey) => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(TIMETABLE_ACTIVE_PLAN_STORAGE_KEY, planKey);
};

export const loadTimetablePlanSelections = (): TimetablePlanSelections => {
  const fallback = createEmptyPlanSelections();
  const loaded = loadObject<Partial<TimetablePlanSelections> | null>(
    TIMETABLE_PLAN_SELECTIONS_STORAGE_KEY,
    null,
  );

  if (!loaded) {
    return {
      ...fallback,
      A: loadSelectedTimetableIds(),
    };
  }

  return {
    A: Array.isArray(loaded.A) ? loaded.A : [],
    B: Array.isArray(loaded.B) ? loaded.B : [],
    C: Array.isArray(loaded.C) ? loaded.C : [],
  };
};

export const saveTimetablePlanSelections = (plans: TimetablePlanSelections) =>
  saveObject(TIMETABLE_PLAN_SELECTIONS_STORAGE_KEY, plans);

export const loadTimetablePlanThemeAssignments = (): TimetablePlanThemeAssignments => {
  const loaded = loadObject<Partial<TimetablePlanThemeAssignments>>(
    TIMETABLE_PLAN_THEME_ASSIGNMENTS_STORAGE_KEY,
    {},
  );

  return {
    A: loaded.A && typeof loaded.A === 'object' ? loaded.A : {},
    B: loaded.B && typeof loaded.B === 'object' ? loaded.B : {},
    C: loaded.C && typeof loaded.C === 'object' ? loaded.C : {},
  };
};

export const saveTimetablePlanThemeAssignments = (assignments: TimetablePlanThemeAssignments) =>
  saveObject(TIMETABLE_PLAN_THEME_ASSIGNMENTS_STORAGE_KEY, assignments);

export const toggleStoredId = (ids: string[], value: string) =>
  ids.includes(value) ? ids.filter((id) => id !== value) : [...ids, value];
