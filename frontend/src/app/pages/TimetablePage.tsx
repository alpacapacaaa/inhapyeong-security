import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Heart, Trash2 } from 'lucide-react';
import { courseService } from '../api/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { StarRating } from '../components/StarRating';
import { toast } from 'sonner';
import {
  loadActiveTimetablePlanKey,
  loadTimetableCartIds,
  loadTimetablePlanSelections,
  loadTimetablePlanThemeAssignments,
  saveActiveTimetablePlanKey,
  saveTimetablePlanSelections,
  saveTimetablePlanThemeAssignments,
  saveSelectedTimetableIds,
  saveTimetableCartIds,
  TIMETABLE_BY_COURSE_ID,
  TIMETABLE_DAYS,
  TIMETABLE_CART_STORAGE_KEY,
  TIMETABLE_PLAN_KEYS,
  TIMETABLE_SEEDED_STORAGE_KEY,
  TIMETABLE_SELECTED_STORAGE_KEY,
  TIMETABLE_STARTER_CART_IDS,
  TIMETABLE_STARTER_SELECTED_IDS,
  TimetablePlanKey,
  TimetablePlanSelections,
  TimetablePlanThemeAssignments,
} from '../data/timetableData';
import { Course } from '../types/types';

type TimetableCourse = Course & {
  slots: typeof TIMETABLE_BY_COURSE_ID[string];
};

type BlockTheme = {
  boardSurface: string;
  badge: string;
  outline: string;
  preview: string;
  text: string;
  glow: string;
};

const BASE_VISIBLE_PERIODS = 14;
const BASE_ROW_HEIGHT = 32;
const BASE_ROW_GAP = 0;
const COMPACT_ROW_GAP = 0;
const TARGET_BOARD_HEIGHT =
  BASE_VISIBLE_PERIODS * BASE_ROW_HEIGHT + (BASE_VISIBLE_PERIODS - 1) * BASE_ROW_GAP;

const BLOCK_THEMES: BlockTheme[] = [
  {
    boardSurface: '#f3f8fe',
    badge: 'bg-[#eef6ff] text-[#316c9d]',
    outline: '#afcde8',
    preview: '#e7f1fc',
    text: '#204863',
    glow: 'rgba(159,197,230,0.08)',
  },
  {
    boardSurface: '#f1faf6',
    badge: 'bg-[#edf7f2] text-[#477566]',
    outline: '#bfdccd',
    preview: '#e5f3ec',
    text: '#35584d',
    glow: 'rgba(175,215,202,0.08)',
  },
  {
    boardSurface: '#fbf6ee',
    badge: 'bg-[#faf2e8] text-[#8a673f]',
    outline: '#decbb2',
    preview: '#f6ebdd',
    text: '#724a25',
    glow: 'rgba(223,186,150,0.08)',
  },
  {
    boardSurface: '#f5f0fd',
    badge: 'bg-[#f2ecfb] text-[#75639a]',
    outline: '#d4c6e8',
    preview: '#eee5fa',
    text: '#5d4c7d',
    glow: 'rgba(198,180,225,0.08)',
  },
  {
    boardSurface: '#faf1f4',
    badge: 'bg-[#faeef2] text-[#91616f]',
    outline: '#e3c4ce',
    preview: '#f5e4ea',
    text: '#754d5a',
    glow: 'rgba(223,188,200,0.08)',
  },
  {
    boardSurface: '#f3f7fb',
    badge: 'bg-[#eef4fa] text-[#4d708b]',
    outline: '#bfd1e1',
    preview: '#e5edf5',
    text: '#385165',
    glow: 'rgba(191,209,225,0.08)',
  },
  {
    boardSurface: '#f5f8ef',
    badge: 'bg-[#f2f6ea] text-[#6b7e4b]',
    outline: '#d0dbbb',
    preview: '#e8eedb',
    text: '#53623a',
    glow: 'rgba(208,219,187,0.08)',
  },
  {
    boardSurface: '#f8f3ed',
    badge: 'bg-[#f6eee5] text-[#8a6d4f]',
    outline: '#dfccb8',
    preview: '#efe2d4',
    text: '#6a523b',
    glow: 'rgba(223,204,184,0.08)',
  },
  {
    boardSurface: '#f4f4fa',
    badge: 'bg-[#efeff7] text-[#686b8e]',
    outline: '#cbcce0',
    preview: '#e5e6f2',
    text: '#4e5070',
    glow: 'rgba(203,204,224,0.08)',
  },
  {
    boardSurface: '#f3f8f7',
    badge: 'bg-[#edf6f4] text-[#4d7b72]',
    outline: '#bdd8d2',
    preview: '#e2f0ed',
    text: '#3a5f58',
    glow: 'rgba(189,216,210,0.08)',
  },
];

const formatSlotTime = (startPeriod: number, endPeriod: number) => {
  const startHour = String(8 + startPeriod).padStart(2, '0');
  const endHour = String(9 + endPeriod).padStart(2, '0');
  return `${startHour}:00-${endHour}:00`;
};

export function TimetablePage() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [cartIds, setCartIds] = useState<string[]>([]);
  const [activePlanKey, setActivePlanKey] = useState<TimetablePlanKey>('A');
  const [planSelections, setPlanSelections] = useState<TimetablePlanSelections>({
    A: [],
    B: [],
    C: [],
  });
  const [planThemeAssignments, setPlanThemeAssignments] = useState<TimetablePlanThemeAssignments>({
    A: {},
    B: {},
    C: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [draggedCourseId, setDraggedCourseId] = useState<string | null>(null);
  const [isBoardDragging, setIsBoardDragging] = useState(false);
  const [isBoardRejected, setIsBoardRejected] = useState(false);
  const [recentlyPlacedCourseId, setRecentlyPlacedCourseId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const results = await courseService.getAllCourses();
        setAllCourses(results);
      } catch (error) {
        console.error('Failed to fetch timetable courses', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      const storedCartIds = loadTimetableCartIds();
      const storedPlanSelections = loadTimetablePlanSelections();
      const storedThemeAssignments = loadTimetablePlanThemeAssignments();
      const storedActivePlanKey = loadActiveTimetablePlanKey();

      const needsSeed =
        !window.localStorage.getItem(TIMETABLE_SEEDED_STORAGE_KEY) ||
        storedCartIds.length < Math.min(8, TIMETABLE_STARTER_CART_IDS.length) ||
        storedPlanSelections.A.length < Math.min(4, TIMETABLE_STARTER_SELECTED_IDS.length);

      if (needsSeed) {
        const seededPlanSelections: TimetablePlanSelections = {
          A: TIMETABLE_STARTER_SELECTED_IDS,
          B: [],
          C: [],
        };
        window.localStorage.setItem(TIMETABLE_CART_STORAGE_KEY, JSON.stringify(TIMETABLE_STARTER_CART_IDS));
        window.localStorage.setItem(TIMETABLE_SELECTED_STORAGE_KEY, JSON.stringify(TIMETABLE_STARTER_SELECTED_IDS));
        window.localStorage.setItem(TIMETABLE_SEEDED_STORAGE_KEY, 'true');
        saveTimetablePlanSelections(seededPlanSelections);
        saveTimetablePlanThemeAssignments({ A: {}, B: {}, C: {} });
        saveActiveTimetablePlanKey('A');
        setCartIds(TIMETABLE_STARTER_CART_IDS);
        setPlanSelections(seededPlanSelections);
        setPlanThemeAssignments({ A: {}, B: {}, C: {} });
        setActivePlanKey('A');
      } else {
        setCartIds(storedCartIds);
        setPlanSelections(storedPlanSelections);
        setPlanThemeAssignments(storedThemeAssignments);
        setActivePlanKey(storedActivePlanKey);
      }
    }
    fetchCourses();
  }, []);

  const selectedIds = planSelections[activePlanKey];
  const assignedThemeIndices = planThemeAssignments[activePlanKey];

  useEffect(() => {
    setPlanThemeAssignments((previousAssignments) => {
      const currentAssignments = previousAssignments[activePlanKey] ?? {};
      const nextAssignments: Record<string, number> = {};
      const usedIndices = new Set<number>();

      selectedIds.forEach((courseId) => {
        const assignedIndex = currentAssignments[courseId];

        if (assignedIndex === undefined || usedIndices.has(assignedIndex)) {
          return;
        }

        nextAssignments[courseId] = assignedIndex;
        usedIndices.add(assignedIndex);
      });

      selectedIds.forEach((courseId) => {
        if (nextAssignments[courseId] !== undefined) {
          return;
        }

        const availableIndices = BLOCK_THEMES.map((_, index) => index).filter(
          (index) => !usedIndices.has(index),
        );

        const candidateIndices =
          availableIndices.length > 0
            ? availableIndices
            : BLOCK_THEMES.map((_, index) => index);

        const nextUnusedIndex =
          candidateIndices[Math.floor(Math.random() * candidateIndices.length)];

        nextAssignments[courseId] = nextUnusedIndex;
        usedIndices.add(nextUnusedIndex);
      });

      const sameShape =
        Object.keys(currentAssignments).length === Object.keys(nextAssignments).length &&
        Object.entries(nextAssignments).every(([courseId, index]) => currentAssignments[courseId] === index);

      if (sameShape) {
        return previousAssignments;
      }

      const nextPlanAssignments = {
        ...previousAssignments,
        [activePlanKey]: nextAssignments,
      };
      saveTimetablePlanThemeAssignments(nextPlanAssignments);
      return nextPlanAssignments;
    });
  }, [activePlanKey, selectedIds]);

  const cartCourses = useMemo<TimetableCourse[]>(
    () =>
      allCourses
        .filter((course) => cartIds.includes(course.id))
        .map((course) => ({
          ...course,
          slots: TIMETABLE_BY_COURSE_ID[course.id] ?? [],
        }))
        .sort((a, b) => {
          const aPlaced = selectedIds.includes(a.id);
          const bPlaced = selectedIds.includes(b.id);

          if (aPlaced !== bPlaced) {
            return aPlaced ? -1 : 1;
          }

          const aMajor = a.category === '전공';
          const bMajor = b.category === '전공';

          if (aMajor !== bMajor) {
            return aMajor ? -1 : 1;
          }

          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }

          return a.name.localeCompare(b.name, 'ko');
        }),
    [allCourses, cartIds, selectedIds],
  );

  const placedCourses = useMemo(
    () => cartCourses.filter((course) => selectedIds.includes(course.id)),
    [cartCourses, selectedIds],
  );

  const unplacedCourses = useMemo(
    () => cartCourses.filter((course) => !selectedIds.includes(course.id)),
    [cartCourses, selectedIds],
  );

  const placedEntries = useMemo(
    () =>
      placedCourses.flatMap((course) =>
        course.slots.map((slot) => ({
          ...slot,
          courseId: course.id,
          courseName: course.name,
          professor: course.professor,
          credits: course.credits ?? 3,
        })),
      ),
    [placedCourses],
  );

  const dayColumns = useMemo(
    () =>
      TIMETABLE_DAYS.map((day) => ({
        day,
        entries: placedEntries.filter((entry) => entry.day === day),
      })),
    [placedEntries],
  );

  const conflicts = useMemo(
    () =>
      placedEntries.flatMap((entry, index) =>
        placedEntries.slice(index + 1).flatMap((other) => {
          const overlaps =
            entry.day === other.day &&
            entry.startPeriod <= other.endPeriod &&
            other.startPeriod <= entry.endPeriod;

          if (!overlaps) {
            return [];
          }

          return [
            `${entry.day} ${entry.courseName} · ${other.courseName} 시간이 겹칩니다.`,
          ];
        }),
      ),
    [placedEntries],
  );

  const totalCredits = placedCourses.reduce((sum, course) => sum + (course.credits ?? 3), 0);

  const draggedCourse = useMemo(
    () => cartCourses.find((course) => course.id === draggedCourseId) ?? null,
    [cartCourses, draggedCourseId],
  );

  const nextUnusedThemeIndex = useMemo(() => {
    const usedIndices = new Set(Object.values(assignedThemeIndices));
    const nextFreeIndex = BLOCK_THEMES.findIndex((_, index) => !usedIndices.has(index));

    return nextFreeIndex === -1 ? 0 : nextFreeIndex;
  }, [assignedThemeIndices]);

  const previewTheme = useMemo(() => {
    if (!draggedCourseId) {
      return null;
    }

    const assignedIndex = assignedThemeIndices[draggedCourseId];
    return BLOCK_THEMES[assignedIndex ?? nextUnusedThemeIndex];
  }, [assignedThemeIndices, draggedCourseId, nextUnusedThemeIndex]);

  const planSummaries = useMemo(
    () =>
      TIMETABLE_PLAN_KEYS.map((planKey) => {
        const planIds = planSelections[planKey];
        const courses = allCourses.filter((course) => planIds.includes(course.id));
        const totalCredits = courses.reduce((sum, course) => sum + (course.credits ?? 3), 0);

        return {
          planKey,
          count: planIds.length,
          credits: totalCredits,
        };
      }),
    [allCourses, planSelections],
  );

  const previewEntries = useMemo(
    () =>
      draggedCourse
        ? draggedCourse.slots.map((slot) => ({
            ...slot,
            courseId: draggedCourse.id,
            courseName: draggedCourse.name,
            professor: draggedCourse.professor,
          }))
        : [],
    [draggedCourse],
  );

  const previewConflicts = useMemo(
    () =>
      previewEntries.some((entry) =>
        placedEntries.some(
          (placed) =>
            placed.courseId !== entry.courseId &&
            placed.day === entry.day &&
            entry.startPeriod <= placed.endPeriod &&
            placed.startPeriod <= entry.endPeriod,
        ),
      ),
    [placedEntries, previewEntries],
  );

  const latestScheduledPeriod = useMemo(
    () =>
      Math.max(
        BASE_VISIBLE_PERIODS,
        ...cartCourses.flatMap((course) => course.slots.map((slot) => slot.endPeriod)),
      ),
    [cartCourses],
  );

  const displayedPeriods = useMemo(
    () =>
      Array.from({ length: latestScheduledPeriod }, (_, index) => {
        const hour = 9 + index;
        return {
          period: index + 1,
          label: `${index + 1}교시`,
          time: `${String(hour).padStart(2, '0')}:00`,
        };
      }),
    [latestScheduledPeriod],
  );

  const rowGap = latestScheduledPeriod > BASE_VISIBLE_PERIODS ? COMPACT_ROW_GAP : BASE_ROW_GAP;
  const rowHeight =
    latestScheduledPeriod > BASE_VISIBLE_PERIODS
      ? Math.max(
          26,
          Math.floor((TARGET_BOARD_HEIGHT - (latestScheduledPeriod - 1) * rowGap) / latestScheduledPeriod),
        )
      : BASE_ROW_HEIGHT;
  const boardHeight =
    displayedPeriods.length * rowHeight + (displayedPeriods.length - 1) * rowGap;

  const getRowTop = (period: number) => (period - 1) * (rowHeight + rowGap);

  const getEntryFrame = (startPeriod: number, endPeriod: number) => ({
    top: getRowTop(startPeriod),
    height:
      (endPeriod - startPeriod + 1) * rowHeight +
      (endPeriod - startPeriod) * rowGap +
      1,
  });

  const hasPlacementConflict = (courseId: string, baseSelectedIds = selectedIds) => {
    const nextSlots = TIMETABLE_BY_COURSE_ID[courseId] ?? [];
    const compareIds = baseSelectedIds.filter((id) => id !== courseId);

    return compareIds.some((selectedId) =>
      (TIMETABLE_BY_COURSE_ID[selectedId] ?? []).some(
        (placed) =>
          nextSlots.some(
            (slot) =>
              placed.day === slot.day &&
              slot.startPeriod <= placed.endPeriod &&
              placed.startPeriod <= slot.endPeriod,
          ),
      ),
    );
  };

  const conflictingCourseIds = useMemo(
    () =>
      new Set(
        cartCourses
          .filter((course) => !selectedIds.includes(course.id) && hasPlacementConflict(course.id))
          .map((course) => course.id),
      ),
    [cartCourses, selectedIds],
  );

  const updateActivePlanSelections = (nextIds: string[]) => {
    const nextPlanSelections = {
      ...planSelections,
      [activePlanKey]: nextIds,
    };
    setPlanSelections(nextPlanSelections);
    saveTimetablePlanSelections(nextPlanSelections);
    saveSelectedTimetableIds(nextPlanSelections.A);
  };

  const placeCourse = (courseId: string) => {
    if (selectedIds.includes(courseId)) {
      return true;
    }

    if (hasPlacementConflict(courseId)) {
      toast.error('겹치는 강의가 있어서 이 블록은 놓을 수 없어요.');
      return false;
    }

    const next = [...selectedIds, courseId];
    updateActivePlanSelections(next);
    return true;
  };

  const handlePlaceCourse = (courseId: string) => {
    const placed = placeCourse(courseId);
    if (placed) {
      toast.success('강의를 시간표에 담았어요.');
    }
  };

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    courseId: string,
  ) => {
    event.dataTransfer.setData('text/plain', courseId);
    event.dataTransfer.effectAllowed = 'move';
    setDraggedCourseId(courseId);
  };

  const handleDragEnd = () => {
    setDraggedCourseId(null);
    setIsBoardDragging(false);
  };

  const handleUnplaceCourse = (courseId: string) => {
    const next = selectedIds.filter((id) => id !== courseId);
    updateActivePlanSelections(next);
  };

  const handleBoardDrop = () => {
    if (!draggedCourseId) {
      return;
    }

    if (hasPlacementConflict(draggedCourseId)) {
      setIsBoardRejected(true);
      setIsBoardDragging(false);
      setTimeout(() => setIsBoardRejected(false), 450);
      toast.error('시간이 겹쳐서 이 위치에는 올릴 수 없어요.');
      return;
    }

    if (!selectedIds.includes(draggedCourseId)) {
      const placed = placeCourse(draggedCourseId);
      if (!placed) {
        setIsBoardRejected(true);
        setIsBoardDragging(false);
        setTimeout(() => setIsBoardRejected(false), 450);
        return;
      }
      toast.success('시간표 보드에 블록을 올렸어요.');
      setRecentlyPlacedCourseId(draggedCourseId);
      setTimeout(() => setRecentlyPlacedCourseId(null), 420);
    }

    setDraggedCourseId(null);
    setIsBoardDragging(false);
  };

  const handleRemoveFromCart = (courseId: string) => {
    const nextCartIds = cartIds.filter((id) => id !== courseId);
    const nextPlanSelections = TIMETABLE_PLAN_KEYS.reduce(
      (acc, planKey) => ({
        ...acc,
        [planKey]: planSelections[planKey].filter((id) => id !== courseId),
      }),
      {} as TimetablePlanSelections,
    );
    const nextPlanThemeAssignments = TIMETABLE_PLAN_KEYS.reduce(
      (acc, planKey) => {
        const { [courseId]: _removed, ...restAssignments } = planThemeAssignments[planKey];
        return {
          ...acc,
          [planKey]: restAssignments,
        };
      },
      {} as TimetablePlanThemeAssignments,
    );

    setCartIds(nextCartIds);
    setPlanSelections(nextPlanSelections);
    setPlanThemeAssignments(nextPlanThemeAssignments);
    saveTimetableCartIds(nextCartIds);
    saveTimetablePlanSelections(nextPlanSelections);
    saveTimetablePlanThemeAssignments(nextPlanThemeAssignments);
    saveSelectedTimetableIds(nextPlanSelections.A);
  };

  const handlePlaceAll = () => {
    const nextSelectedIds = [...selectedIds];
    let placedCount = 0;
    let skippedCount = 0;

    cartCourses.forEach((course) => {
      if (nextSelectedIds.includes(course.id)) {
        return;
      }

      if (hasPlacementConflict(course.id, nextSelectedIds)) {
        skippedCount += 1;
        return;
      }

      nextSelectedIds.push(course.id);
      placedCount += 1;
    });

    updateActivePlanSelections(nextSelectedIds);

    if (placedCount > 0 && skippedCount > 0) {
      toast.success(`겹치지 않는 ${placedCount}개 강의만 먼저 담았어요. ${skippedCount}개는 충돌로 제외됐습니다.`);
      return;
    }

    if (placedCount > 0) {
      toast.success(`${placedCount}개 강의를 한 번에 시간표에 담았어요.`);
      return;
    }

    if (skippedCount > 0) {
      toast.error('겹치지 않게 넣을 수 있는 강의가 없어 전체 배치를 건너뛰었습니다.');
    }
  };

  const handleClearPlaced = () => {
    updateActivePlanSelections([]);
  };

  const handleSwitchPlan = (planKey: TimetablePlanKey) => {
    setActivePlanKey(planKey);
    saveActiveTimetablePlanKey(planKey);
    setDraggedCourseId(null);
    setIsBoardDragging(false);
    setIsBoardRejected(false);
  };

  return (
    <div className="min-h-screen">
      <div className="page-shell flex min-h-[calc(100vh-92px)] flex-col gap-4 py-5">
        <section className="rounded-[1.5rem] border border-[#dbe4ee] bg-white px-5 py-4 shadow-[0_14px_28px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#005bac]">Timetable Planner</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">강의 고르기와 시간표 조립을 한 화면에서</h1>
              <p className="mt-1 text-sm text-slate-500">찜한 강의를 보면서 바로 이번 주 시간표에 담아볼 수 있습니다.</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {planSummaries.map((plan) => {
                  const isActive = activePlanKey === plan.planKey;

                  return (
                    <button
                      key={plan.planKey}
                      type="button"
                      onClick={() => handleSwitchPlan(plan.planKey)}
                      className={`rounded-[1rem] border px-3 py-2 text-left transition-colors ${
                        isActive
                          ? 'border-[#9fc5e6] bg-[#eff7ff]'
                          : 'border-[#dbe4ee] bg-white hover:bg-slate-50'
                      }`}
                    >
                      <p className={`text-[11px] font-black uppercase tracking-[0.14em] ${isActive ? 'text-[#316c9d]' : 'text-slate-400'}`}>
                        Plan {plan.planKey}
                      </p>
                      <p className={`mt-1 text-sm font-black ${isActive ? 'text-slate-950' : 'text-slate-700'}`}>
                        {plan.count}과목 · {plan.credits}학점
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 xl:min-w-[520px] xl:max-w-[560px] xl:items-end">
              <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                <Link to="/search">
                  <Button variant="outline" className="h-10 rounded-full px-4 font-bold">
                    강의 더 담기
                  </Button>
                </Link>
                <Button onClick={handlePlaceAll} disabled={cartCourses.length === 0} className="h-10 rounded-full px-4 font-bold text-white">
                  겹치지 않는 강의 담기
                </Button>
                <Button variant="ghost" onClick={handleClearPlaced} disabled={placedCourses.length === 0} className="h-10 rounded-full px-4 font-bold text-slate-500">
                  시간표 비우기
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <section className="rounded-[1.5rem] border border-[#dbe4ee] bg-white p-5 shadow-[0_14px_32px_rgba(15,23,42,0.04)] xl:sticky xl:top-24 xl:self-start">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#005bac]">Browse</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">찜한 강의</h2>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-[#f5f8fc] px-3 py-1.5">
                <Heart className="h-4 w-4 text-[#6f8fb0]" />
                <span className="text-xs font-black text-[#4c6f96]">{cartCourses.length}개</span>
              </div>
            </div>

            {isLoading ? (
              <div className="rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-400">
                불러오는 중
              </div>
            ) : cartCourses.length === 0 ? (
              <div className="rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                <p className="font-bold text-slate-600">아직 찜한 강의가 없습니다.</p>
                <p className="mt-2 text-sm text-slate-500">강의 둘러보기에서 마음에 드는 강의를 담아오면 여기에서 바로 비교할 수 있어요.</p>
              </div>
            ) : (
              <div className="space-y-2.5 xl:max-h-[calc(100vh-250px)] xl:overflow-y-auto xl:pr-1">
                {cartCourses.map((course) => {
                  const blockTheme = BLOCK_THEMES[assignedThemeIndices[course.id] ?? 0];
                  const isPlaced = selectedIds.includes(course.id);
                  const hasConflict = conflictingCourseIds.has(course.id);
                  const listAccent = isPlaced ? blockTheme.outline : '#d8dee8';
                  const slotClassName = isPlaced
                    ? blockTheme.badge
                      : hasConflict
                      ? 'bg-[#fbefef] text-[#b55a67]'
                      : 'bg-[#f3f5f8] text-slate-500';

                  return (
                    <article
                      key={course.id}
                      draggable
                      onDragStart={(event) => handleDragStart(event, course.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => {
                        if (!isPlaced) {
                          handlePlaceCourse(course.id);
                        }
                      }}
                      className={`grid grid-cols-[8px_minmax(0,1fr)_auto] items-center gap-3 rounded-[1rem] border px-3 py-3 transition-all hover:border-[#c7d8ea] ${
                        draggedCourseId === course.id
                          ? 'scale-[1.01] border-[#97bbdf] shadow-[0_18px_28px_rgba(15,23,42,0.08)]'
                          : 'border-[#dbe4ee]'
                      } ${
                        isPlaced
                          ? 'bg-white cursor-grab'
                          : hasConflict
                            ? 'bg-[#faf5f5] cursor-pointer border-[#ead6d9]'
                            : 'bg-[#f5f7fa] cursor-pointer'
                      }`}
                      style={
                        isPlaced
                          ? {
                              backgroundColor: blockTheme.boardSurface,
                              boxShadow: `0 10px 20px -18px ${blockTheme.glow}`,
                            }
                          : undefined
                      }
                    >
                      <span
                        className="h-full min-h-14 rounded-full"
                        style={{ backgroundColor: listAccent }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            {course.category} · {course.credits ?? 3}학점
                          </span>
                          {hasConflict ? (
                            <span className="rounded-full bg-[#fbefef] px-2 py-1 text-[10px] font-black text-[#b55a67]">
                              시간 겹침
                            </span>
                          ) : null}
                        </div>
                        <p
                          className={`mt-2 line-clamp-1 text-[15px] font-black tracking-tight ${
                            isPlaced ? 'text-slate-950' : 'text-slate-500'
                          }`}
                        >
                          {course.name}
                        </p>
                        <div className={`mt-1 flex items-center gap-2 text-xs ${isPlaced ? 'text-slate-500' : 'text-slate-400'}`}>
                          <span className="line-clamp-1 font-semibold">{course.professor}</span>
                          <StarRating
                            value={course.rating}
                            size="sm"
                            showValue={false}
                            starClassName="h-3 w-3"
                            filledStarClassName={isPlaced ? 'fill-[#f2b94b] text-[#f2b94b]' : 'fill-[#cfd6df] text-[#cfd6df]'}
                            emptyStarClassName={isPlaced ? 'fill-[#f5efe1] text-[#eadfc7]' : 'fill-[#edf1f5] text-[#edf1f5]'}
                          />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {course.slots.map((slot) => (
                            <span
                              key={`${course.id}-${slot.day}-${slot.startPeriod}`}
                              className={`rounded-full px-2 py-1 text-[10px] font-bold ${slotClassName}`}
                            >
                              {slot.day} {formatSlotTime(slot.startPeriod, slot.endPeriod)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (isPlaced) {
                              handleUnplaceCourse(course.id);
                            } else {
                              handlePlaceCourse(course.id);
                            }
                          }}
                          className={`inline-flex h-9 items-center justify-center rounded-full border px-3 text-xs font-black transition-colors ${
                            isPlaced ? 'hover:brightness-[0.98]' : 'border-[#d7dee7] bg-white text-slate-500 hover:bg-slate-50'
                          }`}
                          style={
                            isPlaced
                              ? {
                                  borderColor: blockTheme.outline,
                                  backgroundColor: blockTheme.boardSurface,
                                  color: blockTheme.text,
                                }
                              : undefined
                          }
                        >
                          {isPlaced ? '빼기' : '담기'}
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRemoveFromCart(course.id);
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6e2ef] bg-white text-slate-500 transition-colors hover:bg-slate-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <div className="space-y-4">
            <Card
              className={`overflow-hidden rounded-[1.45rem] border bg-white shadow-[0_14px_32px_rgba(15,23,42,0.04)] transition-all ${
                isBoardRejected
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : isBoardDragging
                    ? previewConflicts
                      ? 'border-rose-300'
                      : 'border-[#97bbdf]'
                    : 'border-[#dbe4ee]'
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                if (draggedCourseId) {
                  setIsBoardDragging(true);
                }
              }}
              onDragLeave={(event) => {
                const nextTarget = event.relatedTarget as Node | null;
                if (!event.currentTarget.contains(nextTarget)) {
                  setIsBoardDragging(false);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                handleBoardDrop();
              }}
            >
              <CardContent className="flex flex-1 flex-col p-4 md:p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#5e88b8]">Weekly Planner</p>
                    <h2 className="mt-1 text-[28px] font-black tracking-[-0.04em] text-slate-950">이번 주 시간표</h2>
                    {draggedCourse ? (
                      <p className={`mt-2 text-sm font-semibold ${previewConflicts ? 'text-rose-500' : 'text-slate-500'}`}>
                        {previewConflicts ? `${draggedCourse.name}은 겹쳐서 담을 수 없어요` : `${draggedCourse.name}을 시간표에 넣을 수 있어요`}
                      </p>
                    ) : placedCourses.length === 0 ? (
                      <p className="mt-2 text-sm font-medium text-slate-500">왼쪽에서 고른 강의를 바로 시간표에 담아보세요.</p>
                    ) : (
                      <p className="mt-2 text-sm font-medium text-slate-500">담아둔 강의를 주간 흐름으로 바로 확인할 수 있어요.</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="relative mx-auto w-fit">
                    <div className="grid w-fit grid-cols-[64px_repeat(5,132px)] gap-0 lg:grid-cols-[68px_repeat(5,144px)] xl:grid-cols-[72px_repeat(5,152px)]">
                    <div className="h-11 border border-[#e4ebf3] bg-[#fafcff]" />
                    {TIMETABLE_DAYS.map((day, index) => (
                      <div
                        key={day}
                        className={`flex h-11 items-center justify-center border-b border-t border-r border-[#e4ebf3] bg-[#fafcff] text-[15px] font-semibold tracking-[-0.03em] text-slate-700 ${
                          index === 0 ? 'border-l' : ''
                        }`}
                      >
                        {day}
                      </div>
                    ))}

                    <div className="relative border-x border-b border-[#e4ebf3] bg-[#fbfcfe]" style={{ height: boardHeight }}>
                      {displayedPeriods.map((period) => (
                        <div
                          key={`label-${period.period}`}
                          className="absolute left-0 right-0 flex flex-col items-center justify-center border-t border-[#e7edf4] bg-[#fbfcfe] text-center"
                          style={{ top: getRowTop(period.period) }}
                        >
                          <div className="flex w-full flex-col items-center justify-center" style={{ height: rowHeight }}>
                            <p className="text-[13px] font-semibold tracking-[-0.03em] text-slate-500">{period.time}</p>
                          </div>
                        </div>
                      ))}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-[#e4ebf3]" />
                    </div>

                    {dayColumns.map((column, index) => (
                      <div
                        key={column.day}
                        className={`relative overflow-hidden border-b border-r border-[#e4ebf3] bg-white ${
                          index === 0 ? 'border-l' : ''
                        }`}
                        style={{ height: boardHeight }}
                      >
                        {displayedPeriods.map((period) => (
                          <div
                            key={`${column.day}-cell-${period.period}`}
                            className="absolute left-0 right-0 border-t border-[#eef3f8] bg-white"
                            style={{ top: getRowTop(period.period), height: rowHeight }}
                          />
                        ))}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] border-t border-[#e4ebf3]" />

                        {draggedCourse &&
                          previewEntries
                            .filter((entry) => entry.day === column.day)
                            .map((entry) => {
                              const frame = getEntryFrame(entry.startPeriod, entry.endPeriod);

                              return (
                                <div
                                  key={`preview-${entry.courseId}-${entry.day}-${entry.startPeriod}`}
                                  className={`pointer-events-none absolute left-0 right-0 overflow-hidden border px-2 py-2 ${
                                    previewConflicts ? 'border-rose-300 bg-rose-50/85' : ''
                                  }`}
                                  style={
                                    previewConflicts
                                      ? { ...frame }
                                      : {
                                          ...frame,
                                          borderColor: previewTheme?.outline,
                                          backgroundColor: previewTheme?.preview,
                                        }
                                  }
                                >
                                  <p
                                    className={`relative z-10 line-clamp-2 break-keep text-xs font-black ${
                                      previewConflicts ? 'text-rose-600' : ''
                                    }`}
                                    style={previewConflicts ? undefined : { color: previewTheme?.text }}
                                  >
                                    {entry.courseName}
                                  </p>
                                </div>
                              );
                            })}

                        {column.entries.map((entry) => {
                          const frame = getEntryFrame(entry.startPeriod, entry.endPeriod);
                          const blockTheme = BLOCK_THEMES[assignedThemeIndices[entry.courseId] ?? 0];

                          return (
                            <div
                              key={`${entry.courseId}-${entry.day}-${entry.startPeriod}`}
                              draggable
                              onDragStart={(event) => handleDragStart(event, entry.courseId)}
                              onDragEnd={handleDragEnd}
                              onClick={() => handleUnplaceCourse(entry.courseId)}
                              className={`absolute left-0 right-0 cursor-grab overflow-hidden border transition-all active:cursor-grabbing ${
                                recentlyPlacedCourseId === entry.courseId ? 'scale-[1.01] animate-[pulse_350ms_ease-out_1]' : ''
                              }`}
                              style={{
                                ...frame,
                                borderColor: blockTheme.outline,
                                borderRadius: '12px',
                                backgroundColor: blockTheme.boardSurface,
                                boxShadow: `0 10px 20px -18px ${blockTheme.glow}`,
                                color: blockTheme.text,
                              }}
                            >
                              <div className="relative z-10 flex h-full flex-col p-2">
                                <p className="line-clamp-2 break-keep text-[13px] font-black leading-[1.2] tracking-[-0.03em]">{entry.courseName}</p>
                                <p className="mt-auto line-clamp-1 text-[11px] font-medium opacity-75">{entry.location}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    </div>

                    {placedCourses.length === 0 && !draggedCourse ? (
                      <div className="pointer-events-none absolute left-1/2 top-[calc(50%+22px)] z-10 w-[360px] max-w-[calc(100%-80px)] -translate-x-1/2 -translate-y-1/2 px-6 text-center">
                        <div>
                          <p className="text-base font-bold tracking-[-0.03em] text-slate-400">비어 있음</p>
                          <p className="mt-2 text-sm font-medium leading-6 text-slate-400">찜한 강의를 담아 시간표를 완성해보세요.</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
