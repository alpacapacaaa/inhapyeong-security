export type TimetableDay = '월' | '화' | '수' | '목' | '금';

export type TimetableSlot = {
  day: TimetableDay;
  startPeriod: number;
  endPeriod: number;
  location: string;
};

export const TIMETABLE_CART_STORAGE_KEY = 'timetable_cart_courses';
export const TIMETABLE_SELECTED_STORAGE_KEY = 'timetable_selected_courses';

export const TIMETABLE_DAYS: TimetableDay[] = ['월', '화', '수', '목', '금'];

export const PERIODS = [
  { period: 1, label: '1교시', time: '09:00' },
  { period: 2, label: '2교시', time: '10:00' },
  { period: 3, label: '3교시', time: '11:00' },
  { period: 4, label: '4교시', time: '12:00' },
  { period: 5, label: '5교시', time: '13:00' },
  { period: 6, label: '6교시', time: '14:00' },
  { period: 7, label: '7교시', time: '15:00' },
  { period: 8, label: '8교시', time: '16:00' },
  { period: 9, label: '9교시', time: '17:00' },
];

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
};

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

export const toggleStoredId = (ids: string[], value: string) =>
  ids.includes(value) ? ids.filter((id) => id !== value) : [...ids, value];
