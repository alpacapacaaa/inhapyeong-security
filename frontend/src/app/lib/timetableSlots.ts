import { TIMETABLE_BY_COURSE_ID, TimetableSlot } from '../data/timetableData';
import { Course } from '../types/types';

type CourseWithOptionalSlots = Pick<Course, 'id' | 'slots'>;

export const getCourseSlots = (course: CourseWithOptionalSlots): TimetableSlot[] => {
  if (Array.isArray(course.slots)) {
    return course.slots;
  }

  return TIMETABLE_BY_COURSE_ID[course.id] ?? [];
};

export const buildSlotsByCourseId = (courses: CourseWithOptionalSlots[]) =>
  Object.fromEntries(courses.map((course) => [course.id, getCourseSlots(course)]));
