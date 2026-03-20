import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { CourseCardSkeleton } from '../components/course/CourseSkeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { courseService, userService } from '../api/api';
import { departments } from '../data/mockData';
import {
  loadTimetableCartIds,
  PERIODS,
  TIMETABLE_BY_COURSE_ID,
  TIMETABLE_DAYS,
  TimetableSlot,
  saveTimetableCartIds,
} from '../data/timetableData';
import { Course } from '../types/types';
import {
  AlertTriangle,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Star,
  X,
} from 'lucide-react';
const CURRENT_OPEN_COURSE_IDS = new Set(['1', '3', '6', '8', '9', '101', '202', '206']);

type SearchResultItem = Course & {
  isOpenCurrent: boolean;
};

type BrowseSubjectGroup = {
  key: string;
  name: string;
  department: string;
  category: Course['category'];
  type: string;
  isOpenCurrent: boolean;
  professors: SearchResultItem[];
};

const majorTypes = ['전공필수', '전공선택', '전공기초'];

const themes = [
  { id: 'all', label: '전체보기' },
  { id: 'top-rated', label: '명강의' },
  { id: 'easy-credit', label: '널널한 꿀강' },
  { id: 'most-reviewed', label: '검증된 강의' },
  { id: 'growth', label: '성장형 강의' },
];

const geGroups = {
  핵심교양: [
    '핵심교양-1.인간, 가치, 공존',
    '핵심교양-1.인간, 가치, 공존(공학윤리와 토론)',
    '핵심교양-2.역사, 사상, 문화',
    '핵심교양-3.문학, 예술, 상징',
    '핵심교양-4.사회, 제도, 세계',
    '핵심교양-5.자연, 생명, 환경',
    '핵심교양-6.수리, 정보, 기술',
  ],
  일반교양: [
    '일반교양-1.인문 · 예술',
    '일반교양-2. 사회 · 자연',
    '일반교양-3.소통 · 실천',
    '일반교양-4.창의 · 도전',
    '일반교양-5.실용 · 진로',
    '일반교양-6.생활 · 건강',
    '일반교양-7.SW·AI',
  ],
  기타: ['창의'],
};

const difficultyLabel = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움',
};

const workloadLabel = {
  light: '적음',
  medium: '보통',
  heavy: '많음',
};

const sortByKoreanName = <T extends { name: string }>(items: T[]) =>
  [...items].sort((a, b) => a.name.localeCompare(b.name, 'ko'));

const getCourseOpenState = (course: Course) => CURRENT_OPEN_COURSE_IDS.has(course.id);


function TimetablePanel({
  open,
  cartCourses,
  onClose,
  onToggleCart,
}: {
  open: boolean;
  cartCourses: SearchResultItem[];
  onClose: () => void;
  onToggleCart: (courseId: string) => void;
}) {
  const cartEntries = cartCourses.flatMap((course) =>
    (TIMETABLE_BY_COURSE_ID[course.id] ?? []).map((slot) => ({
      ...slot,
      courseId: course.id,
      courseName: course.name,
      professor: course.professor,
    })),
  );

  const conflicts = cartEntries.flatMap((entry, index) =>
    cartEntries.slice(index + 1).flatMap((other) => {
      const overlaps =
        entry.day === other.day &&
        entry.startPeriod <= other.endPeriod &&
        other.startPeriod <= entry.endPeriod;

      if (!overlaps) {
        return [];
      }

      return [
        `${entry.day} ${entry.courseName}(${entry.professor}) · ${other.courseName}(${other.professor}) 시간이 겹칩니다.`,
      ];
    }),
  );

  const dayColumns = TIMETABLE_DAYS.map((day) => ({
    day,
    entries: cartEntries
      .filter((entry) => entry.day === day)
      .sort((a, b) => a.startPeriod - b.startPeriod),
  }));

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[2px] transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      <div
        className={`fixed bottom-6 right-6 z-50 w-[min(92vw,860px)] rounded-[2rem] border border-[#005bac]/10 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] transition-all duration-300 ${
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#005bac]/8 px-6 py-5">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#005bac]">시간표 장바구니</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">시간표 장바구니</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">담은 강의를 주간 시간표 형태로 먼저 확인해볼 수 있어요.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-[#cfe4f7] bg-[#f8fbff] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#005bac]">담은 강의</p>
                  <p className="mt-2 text-3xl font-black text-slate-950">{cartCourses.length}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#005bac] shadow-sm">
                  <ShoppingBag className="h-5 w-5" />
                </div>
              </div>
            </div>

            {conflicts.length > 0 && (
              <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-4">
                <div className="flex items-center gap-2 text-rose-700">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-sm font-black">시간이 겹치는 강의가 있어요</p>
                </div>
                <ul className="mt-3 space-y-2 text-sm font-medium text-rose-700">
                  {conflicts.map((conflict) => (
                    <li key={conflict}>- {conflict}</li>
                  ))}
                </ul>
              </div>
            )}

                <div className="space-y-3">
                  {cartCourses.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-base font-bold text-slate-500">아직 담은 강의가 없습니다.</p>
                  <p className="mt-2 text-sm text-slate-400">검색 결과나 교수님 선택 목록에서 장바구니에 담아보세요.</p>
                </div>
              ) : (
                cartCourses.map((course) => (
                  <div key={course.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-black text-slate-900">{course.name}</p>
                        <p className="mt-1 text-sm font-medium text-slate-500">{course.professor} 교수님</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(TIMETABLE_BY_COURSE_ID[course.id] ?? []).map((slot) => (
                            <span key={`${course.id}-${slot.day}-${slot.startPeriod}`} className="rounded-full bg-[#eef7ff] px-3 py-1.5 text-xs font-bold text-[#005bac]">
                              {slot.day} {slot.startPeriod}-{slot.endPeriod}교시
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onToggleCart(course.id)}
                        className="h-9 rounded-full px-4 text-xs font-bold"
                      >
                        제거
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[#d7e7f6] bg-[#fbfdff] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#005bac]">주간 시간표</p>
                <p className="mt-1 text-sm font-medium text-slate-500">장바구니에 담은 강의를 시간표로 미리 볼 수 있습니다.</p>
              </div>
              <Badge className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-600 border border-slate-200">
                {cartEntries.length}교시
              </Badge>
            </div>

            <div className="mb-4 rounded-[1.25rem] border border-[#d7e7f6] bg-white p-3">
              <Link
                to="/timetable"
                className="flex items-center justify-between rounded-full bg-gradient-to-r from-[#005bac] to-[#1084e8] px-4 py-3 text-sm font-black text-white"
              >
                <span>시간표 조립하러 가기</span>
                <CalendarClock className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-[72px_repeat(5,minmax(0,1fr))] gap-2 text-xs">
              <div />
              {TIMETABLE_DAYS.map((day) => (
                <div key={day} className="rounded-xl bg-white px-2 py-2 text-center font-black text-slate-700 border border-slate-200">
                  {day}
                </div>
              ))}

              {PERIODS.map((period) => (
                <div key={`period-row-${period.period}`} className="contents">
                  <div className="rounded-xl bg-white px-2 py-3 text-center border border-slate-200">
                    <p className="font-black text-slate-700">{period.label}</p>
                    <p className="mt-1 text-[11px] font-medium text-slate-400">{period.time}</p>
                  </div>
                  {TIMETABLE_DAYS.map((day) => {
                    const matchingEntries = dayColumns
                      .find((column) => column.day === day)
                      ?.entries.filter((entry) => entry.startPeriod <= period.period && period.period <= entry.endPeriod) ?? [];

                    return (
                      <div key={`${day}-${period.period}`} className="min-h-[66px] rounded-xl border border-[#e3edf7] bg-white p-2">
                        <div className="space-y-1">
                          {matchingEntries.map((entry) => (
                            <div key={`${entry.courseId}-${entry.day}-${entry.startPeriod}`} className="rounded-lg bg-[#eef7ff] px-2 py-1.5">
                              <p className="line-clamp-1 font-black text-[#005bac]">{entry.courseName}</p>
                              <p className="line-clamp-1 text-[11px] font-medium text-slate-500">{entry.location}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SearchResultCard({
  course,
  isInCart,
  onToggleCart,
}: {
  course: SearchResultItem;
  isInCart: boolean;
  onToggleCart: (courseId: string) => void;
}) {
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(course.rating));

  return (
    <Card className="overflow-hidden rounded-[2rem] border border-[rgba(15,23,42,0.08)] bg-white transition-all hover:-translate-y-0.5 hover:border-[#005bac]/20 hover:shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
      <CardContent className="p-0">
        <div className="p-6 md:p-7">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#1084e8]">
                  {course.category === '전공' ? '전공 강의' : '교양 강의'}
                </p>
                <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900 md:text-[2rem]">
                  {course.name}
                </h3>
                <p className="mt-2 text-base font-semibold text-slate-500 md:text-lg">
                  {course.professor} 교수님 · {course.department}
                </p>
              </div>
              <div className="flex flex-row flex-wrap items-center gap-2 md:flex-col md:items-end">
                <Badge className="rounded-full px-4 py-2 text-sm font-bold">
                  {course.type}
                </Badge>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${
                    course.isOpenCurrent
                      ? 'bg-[#e9f8ef] text-[#177245]'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {course.isOpenCurrent ? '26-1 개설 중' : '현재 미개설'}
                </span>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[rgba(15,23,42,0.08)] bg-[#f7fafc] px-5 py-5">
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">평점</p>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
                      {course.rating.toFixed(1)}
                    </span>
                    <span className="pb-1 text-2xl font-bold text-slate-300">/ 5.0</span>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <div className="flex items-center gap-1 md:justify-end">
                    {stars.map((filled, index) => (
                      <Star
                        key={index}
                        className={`h-7 w-7 ${filled ? 'fill-[#005bac] text-[#005bac]' : 'text-[#c8d0d9]'}`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-base font-bold text-slate-500">리뷰 {course.reviewCount}개</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge className="rounded-full px-4 py-2 text-base font-semibold text-slate-600">
                난이도 {difficultyLabel[course.difficulty]}
              </Badge>
              <Badge className="rounded-full px-4 py-2 text-base font-semibold text-slate-600">
                학습량 {workloadLabel[course.workload]}
              </Badge>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant={isInCart ? 'secondary' : 'outline'} onClick={() => onToggleCart(course.id)} className="h-12 rounded-full px-5 text-sm font-bold">
                <ShoppingBag className="h-4 w-4" />
                {isInCart ? '장바구니에서 제거' : '시간표 장바구니 담기'}
              </Button>

              <Button asChild className="h-12 rounded-full px-6 text-sm font-bold text-white">
                <Link to={`/course/${course.id}`}>강의평 보러가기</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SubjectAccordionCard({
  group,
  expanded,
  onToggle,
  cartIds,
  onToggleCart,
}: {
  group: BrowseSubjectGroup;
  expanded: boolean;
  onToggle: () => void;
  cartIds: string[];
  onToggleCart: (courseId: string) => void;
}) {
  return (
    <Card
      className={`overflow-hidden rounded-[2rem] border transition-all ${
        group.isOpenCurrent
          ? 'border-[rgba(15,23,42,0.08)] bg-white'
          : 'border-slate-200 bg-[#f3f5f7]'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left"
      >
        <CardContent className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={`text-[11px] font-black uppercase tracking-[0.22em] ${group.isOpenCurrent ? 'text-[#1084e8]' : 'text-slate-400'}`}>
                {group.category === '전공' ? '전공 강의' : '교양 강의'}
              </p>
              <h3 className={`mt-3 text-3xl font-black tracking-tight ${group.isOpenCurrent ? 'text-slate-900' : 'text-slate-500'}`}>
                {group.name}
              </h3>
              <p className={`mt-3 text-base font-semibold ${group.isOpenCurrent ? 'text-slate-500' : 'text-slate-400'}`}>
                {group.department} · {group.professors.length}명
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  group.isOpenCurrent
                    ? 'border border-[rgba(15,23,42,0.08)] bg-[#f6f9fc] text-slate-700'
                    : 'border border-slate-200 bg-white text-slate-500'
                }`}
              >
                {group.type}
              </Badge>

              <div className={`flex h-11 w-11 items-center justify-center rounded-full border ${group.isOpenCurrent ? 'border-[rgba(15,23,42,0.08)] bg-[#f7fafc] text-[#005bac]' : 'border-slate-200 bg-white text-slate-400'}`}>
                {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
          </div>
        </CardContent>
      </button>

      {expanded && (
        <div className="border-t border-[#005bac]/8 bg-white/70 px-6 pb-6 md:px-8">
          <div className="space-y-3 pt-5">
            {group.professors.map((course) => {
              const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(course.rating));

              return (
                <div
                  key={course.id}
                className="rounded-[1.5rem] border border-[rgba(15,23,42,0.08)] bg-white px-5 py-4 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-black text-slate-900">{course.professor} 교수님</p>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                            course.isOpenCurrent
                              ? 'bg-[#edf4ff] text-[#005bac]'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {course.isOpenCurrent ? '26-1 개설' : '과거 개설'}
                        </span>
                        </div>
                      <p className="mt-1 text-sm font-medium text-slate-500">리뷰 {course.reviewCount}개</p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3 rounded-full border border-[rgba(15,23,42,0.08)] bg-[#f7fafc] px-4 py-2">
                        <div className="flex items-center gap-1">
                          {stars.map((filled, index) => (
                            <Star
                              key={index}
                              className={`h-4 w-4 ${filled ? 'fill-[#005bac] text-[#005bac]' : 'text-[#bfd3ea]'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-black text-slate-900">{course.rating.toFixed(1)}</span>
                      </div>

                      <Button
                        type="button"
                        variant={cartIds.includes(course.id) ? 'secondary' : 'outline'}
                        onClick={() => onToggleCart(course.id)}
                        className="h-10 rounded-full px-4 text-sm font-bold"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        {cartIds.includes(course.id) ? '담김' : '장바구니'}
                      </Button>

                      <Button asChild className="h-10 rounded-full px-5 text-sm font-bold text-white">
                        <Link to={`/course/${course.id}`}>강의평 보기</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [selectedCategory, setSelectedCategory] = useState<'전체' | '전공' | '교양'>('전체');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedMajorType, setSelectedMajorType] = useState<string>('전체');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState('전체');
  const [allCourses, setAllCourses] = useState<SearchResultItem[]>([]);
  const [courses, setCourses] = useState<SearchResultItem[]>([]);
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>([]);
  const [cartIds, setCartIds] = useState<string[]>([]);
  const [isCartPanelOpen, setIsCartPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type],
    );
  };

  const toggleSubject = (subjectKey: string) => {
    setExpandedSubjects((prev) =>
      prev.includes(subjectKey)
        ? prev.filter((key) => key !== subjectKey)
        : [...prev, subjectKey],
    );
  };

  const toggleCart = (courseId: string) => {
    setCartIds((prev) => {
      const next = prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId];
      saveTimetableCartIds(next);
      return next;
    });
    setIsCartPanelOpen(true);
  };

  useEffect(() => {
    setCartIds(loadTimetableCartIds());
  }, []);

  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        const results = await courseService.getAllCourses();
        setAllCourses(
          results.map((course) => ({
            ...course,
            isOpenCurrent: getCourseOpenState(course),
          })),
        );
      } catch (error) {
        console.error('Failed to fetch all courses for timetable cart', error);
      }
    };

    fetchAllCourses();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await userService.getCurrentUser();
        if (user?.department) {
          setSelectedDepartment(user.department);
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        let results = [];

        if (query.trim()) {
          results = await courseService.searchCourses(query, selectedDepartment);
        } else {
          results = await courseService.getAllCourses();
          if (selectedDepartment !== '전체') {
            results = results.filter((course) => course.department === selectedDepartment);
          }
        }

        if (selectedCategory !== '전체') {
          results = results.filter((course) => course.category === selectedCategory);
        }

        if (selectedMajorType !== '전체' && selectedCategory === '전공') {
          results = results.filter((course) => course.type === selectedMajorType);
        }

        if (selectedTypes.length > 0 && selectedCategory === '교양') {
          results = results.filter((course) => selectedTypes.includes(course.type));
        }

        if (selectedCategory === '전체') {
          if (selectedTheme === 'top-rated') {
            results = results.filter((course) => course.rating >= 4.3);
          } else if (selectedTheme === 'easy-credit') {
            results = results.filter((course) => course.difficulty === 'easy');
          } else if (selectedTheme === 'most-reviewed') {
            results = results.filter((course) => course.reviewCount >= 30);
          } else if (selectedTheme === 'growth') {
            results = results.filter((course) => course.workload === 'heavy');
          }
        }

        const enriched = results.map((course) => ({
          ...course,
          isOpenCurrent: getCourseOpenState(course),
        }));

        setCourses(enriched);
      } catch (error) {
        console.error('Failed to search courses', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [query, selectedDepartment, selectedCategory, selectedTypes, selectedMajorType, selectedTheme]);

  const groupedSubjects = useMemo<BrowseSubjectGroup[]>(() => {
    const map = new Map<string, BrowseSubjectGroup>();

    for (const course of courses) {
      const key = `${course.name}::${course.department}::${course.category}`;
      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          key,
          name: course.name,
          department: course.department,
          category: course.category,
          type: course.type,
          isOpenCurrent: course.isOpenCurrent,
          professors: [course],
        });
        continue;
      }

      existing.professors.push(course);
      existing.isOpenCurrent = existing.isOpenCurrent || course.isOpenCurrent;
    }

    return [...map.values()]
      .map((group) => ({
        ...group,
        professors: [...group.professors].sort((a, b) => a.professor.localeCompare(b.professor, 'ko')),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }, [courses]);

  const currentOpenSubjects = groupedSubjects.filter((group) => group.isOpenCurrent);
  const archivedSubjects = groupedSubjects.filter((group) => !group.isOpenCurrent);
  const cartCourses = useMemo(
    () =>
      allCourses
        .filter((course) => cartIds.includes(course.id))
        .sort((a, b) => a.name.localeCompare(b.name, 'ko')),
    [allCourses, cartIds],
  );
  const sortedSearchResults = useMemo(
    () =>
      [...courses].sort((a, b) => {
        if (a.isOpenCurrent !== b.isOpenCurrent) {
          return a.isOpenCurrent ? -1 : 1;
        }
        const courseNameOrder = a.name.localeCompare(b.name, 'ko');
        if (courseNameOrder !== 0) {
          return courseNameOrder;
        }
        return a.professor.localeCompare(b.professor, 'ko');
      }),
    [courses],
  );
  const activeFilterCount =
    (selectedDepartment !== '전체' ? 1 : 0) +
    (selectedCategory !== '전체' ? 1 : 0) +
    (selectedMajorType !== '전체' ? 1 : 0) +
    selectedTypes.length +
    (selectedTheme !== 'all' ? 1 : 0);

  return (
    <div className="min-h-screen">
      <div className="page-shell py-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside>
            <div className="sticky top-24 rounded-[2rem] border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="space-y-8">
                <div className="space-y-3">
                  <div className={`rounded-[1.5rem] border px-4 py-4 ${
                    selectedDepartment === '전체'
                      ? 'border-slate-200 bg-[#f7fafc]'
                      : 'border-[#cfe0f1] bg-[#edf4ff]'
                  }`}>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">선택 학과</p>
                    <p className={`mt-2 text-2xl font-black tracking-tight ${
                      selectedDepartment === '전체' ? 'text-slate-900' : 'text-[#005bac]'
                    }`}>
                      {selectedDepartment}
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-500">
                      {selectedDepartment === '전체'
                        ? '전체 학과 기준으로 강의를 보고 있습니다.'
                        : '이 학과를 기준으로 강의 목록과 검색 결과를 먼저 보여줍니다.'}
                    </p>
                    {activeFilterCount > 0 && (
                      <span className="mt-3 inline-flex rounded-full border border-white/80 bg-white px-3 py-1 text-xs font-black text-slate-600">
                        필터 {activeFilterCount}개 적용
                      </span>
                    )}
                  </div>
                  <label className="text-[12px] font-black uppercase tracking-[0.18em] text-slate-400">학과 변경</label>
                  <div>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="h-11 rounded-xl bg-white font-semibold text-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department} value={department}>
                            {department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[12px] font-black uppercase tracking-[0.18em] text-slate-400">이수 구분</label>
                    <div className="flex rounded-xl border border-slate-100 bg-slate-50 p-1">
                      {['전체', '전공', '교양'].map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(category as typeof selectedCategory);
                            setSelectedTypes([]);
                            setSelectedMajorType('전체');
                            setSelectedTheme('all');
                          }}
                          className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
                            selectedCategory === category
                              ? 'bg-white text-[#005bac] shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedCategory === '전체' && (
                    <div className="space-y-3">
                      <label className="text-[12px] font-black uppercase tracking-[0.18em] text-slate-400">추천 테마</label>
                      <div className="grid gap-2">
                        {themes.map((theme) => (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => setSelectedTheme(theme.id)}
                            className={`rounded-xl border px-4 py-3 text-left text-sm font-bold transition-all ${
                              selectedTheme === theme.id
                                ? 'border-[rgba(15,23,42,0.08)] bg-[#edf4ff] text-[#005bac]'
                                : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                            }`}
                          >
                            {theme.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCategory === '전공' && (
                    <div className="space-y-3">
                      <label className="text-[12px] font-black uppercase tracking-[0.18em] text-slate-400">전공 분류</label>
                      <div className="grid gap-2">
                        {['전체', ...majorTypes].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setSelectedMajorType(type)}
                            className={`rounded-xl border px-4 py-3 text-left text-sm font-bold transition-all ${
                              selectedMajorType === type
                                ? 'border-[rgba(15,23,42,0.08)] bg-[#edf4ff] text-[#005bac]'
                                : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCategory === '교양' && (
                    <div className="max-h-[440px] space-y-6 overflow-y-auto pr-2">
                      {Object.entries(geGroups).map(([groupName, types]) => (
                        <div key={groupName} className="space-y-3">
                          <label className="pl-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                            {groupName}
                          </label>
                          <div className="grid gap-2">
                            {types.map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => toggleType(type)}
                                className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
                                  selectedTypes.includes(type)
                                    ? 'border-[rgba(15,23,42,0.08)] bg-[#edf4ff] text-[#005bac]'
                                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button type="button" variant="outline" onClick={() => setIsCartPanelOpen(true)} className="w-full justify-between rounded-[1rem] px-4">
                    시간표 장바구니
                    <span className="text-[#005bac]">{cartIds.length}</span>
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            {query && (
              <div className="mb-5 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
                <span className="text-base font-black text-slate-950">"{query}" 검색 결과</span>
                <span className="rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-black text-[#005bac]">
                  {isLoading ? '...' : sortedSearchResults.length}
                </span>
                {selectedDepartment !== '전체' && (
                  <span className="rounded-full border border-[rgba(15,23,42,0.08)] bg-white px-3 py-1 text-xs font-bold text-slate-600">
                    {selectedDepartment}
                  </span>
                )}
              </div>
            )}

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((index) => (
                  <CourseCardSkeleton key={index} />
                ))}
              </div>
            ) : query ? (
              <div className="space-y-4">
                {sortedSearchResults.map((course) => (
                  <SearchResultCard
                    key={course.id}
                    course={course}
                    isInCart={cartIds.includes(course.id)}
                    onToggleCart={toggleCart}
                  />
                ))}

                {sortedSearchResults.length === 0 && (
                  <div className="rounded-[2rem] border border-[rgba(15,23,42,0.08)] bg-white p-12 text-center shadow-sm">
                    <p className="text-lg font-bold text-slate-500">검색 결과가 없습니다.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-10">
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-2xl font-black tracking-tight text-slate-950">이번 학기 개설 과목</h3>
                      {selectedDepartment !== '전체' && (
                        <span className="rounded-full border border-[#cfe0f1] bg-[#edf4ff] px-3 py-1.5 text-xs font-black text-[#005bac]">
                          {selectedDepartment}
                        </span>
                      )}
                    </div>
                    <span className="rounded-full bg-[#edf4ff] px-3 py-1.5 text-xs font-black text-[#005bac]">
                      {currentOpenSubjects.length}개
                    </span>
                  </div>

                  <div className="space-y-4">
                    {sortByKoreanName(currentOpenSubjects).map((group) => (
                      <SubjectAccordionCard
                        key={group.key}
                        group={group}
                        expanded={expandedSubjects.includes(group.key)}
                        onToggle={() => toggleSubject(group.key)}
                        cartIds={cartIds}
                        onToggleCart={toggleCart}
                      />
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black tracking-tight text-slate-500">현재 미개설 과목</h3>
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500">
                      {archivedSubjects.length}개
                    </span>
                  </div>

                  <div className="space-y-4">
                    {sortByKoreanName(archivedSubjects).map((group) => (
                      <SubjectAccordionCard
                        key={group.key}
                        group={group}
                        expanded={expandedSubjects.includes(group.key)}
                        onToggle={() => toggleSubject(group.key)}
                        cartIds={cartIds}
                        onToggleCart={toggleCart}
                      />
                    ))}
                  </div>
                </section>

                {groupedSubjects.length === 0 && (
                  <div className="rounded-[2rem] border border-[rgba(15,23,42,0.08)] bg-white p-12 text-center shadow-sm">
                    <p className="text-lg font-bold text-slate-500">조건에 맞는 강의가 없습니다.</p>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsCartPanelOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-3 rounded-full bg-gradient-to-r from-[#005bac] to-[#1084e8] px-5 py-3 text-sm font-black text-white shadow-[0_20px_40px_rgba(0,91,172,0.28)] transition-transform hover:-translate-y-0.5 xl:hidden"
      >
        <CalendarClock className="h-4 w-4" />
        시간표 장바구니
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{cartIds.length}</span>
      </button>

      <TimetablePanel
        open={isCartPanelOpen}
        cartCourses={cartCourses}
        onClose={() => setIsCartPanelOpen(false)}
        onToggleCart={toggleCart}
      />
    </div>
  );
}
