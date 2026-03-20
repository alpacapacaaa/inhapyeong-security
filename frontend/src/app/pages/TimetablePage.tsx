import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { AlertTriangle, CalendarClock, Plus, Trash2, X } from 'lucide-react';
import { courseService } from '../api/api';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
import {
  loadSelectedTimetableIds,
  loadTimetableCartIds,
  saveSelectedTimetableIds,
  saveTimetableCartIds,
  TIMETABLE_BY_COURSE_ID,
  TIMETABLE_DAYS,
  toggleStoredId,
} from '../data/timetableData';
import { Course } from '../types/types';

type TimetableCourse = Course & {
  slots: typeof TIMETABLE_BY_COURSE_ID[string];
};

const BASE_VISIBLE_PERIODS = 9;
const BASE_ROW_HEIGHT = 44;
const BASE_ROW_GAP = 6;
const COMPACT_ROW_GAP = 4;
const TARGET_BOARD_HEIGHT =
  BASE_VISIBLE_PERIODS * BASE_ROW_HEIGHT + (BASE_VISIBLE_PERIODS - 1) * BASE_ROW_GAP;

const BLOCK_STYLES = [
  'from-[#dff1ff] to-[#eef7ff] border-[#b7daf7] text-[#005bac]',
  'from-[#e7f8ef] to-[#f2fbf6] border-[#b8e5c9] text-[#177245]',
  'from-[#fff0df] to-[#fff8ef] border-[#f4d0a6] text-[#b45b01]',
  'from-[#efeaff] to-[#f7f2ff] border-[#d9cafb] text-[#6246d3]',
  'from-[#ffe5ee] to-[#fff4f7] border-[#f4bfd1] text-[#b33b6a]',
];

const getBlockStyle = (seed: string) => {
  const code = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return BLOCK_STYLES[code % BLOCK_STYLES.length];
};

export function TimetablePage() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [cartIds, setCartIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedCourseId, setDraggedCourseId] = useState<string | null>(null);
  const [dragSource, setDragSource] = useState<'cart' | 'board' | null>(null);
  const [isBoardDragging, setIsBoardDragging] = useState(false);
  const [isBoardRejected, setIsBoardRejected] = useState(false);
  const [isWaitingDrop, setIsWaitingDrop] = useState(false);
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

    setCartIds(loadTimetableCartIds());
    setSelectedIds(loadSelectedTimetableIds());
    fetchCourses();
  }, []);

  const cartCourses = useMemo<TimetableCourse[]>(
    () =>
      allCourses
        .filter((course) => cartIds.includes(course.id))
        .map((course) => ({
          ...course,
          slots: TIMETABLE_BY_COURSE_ID[course.id] ?? [],
        }))
        .sort((a, b) => a.name.localeCompare(b.name, 'ko')),
    [allCourses, cartIds],
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
      (endPeriod - startPeriod) * rowGap,
  });

  const handlePlaceCourse = (courseId: string) => {
    const next = toggleStoredId(selectedIds, courseId);
    setSelectedIds(next);
    saveSelectedTimetableIds(next);
  };

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    courseId: string,
    source: 'cart' | 'board',
  ) => {
    event.dataTransfer.setData('text/plain', courseId);
    event.dataTransfer.effectAllowed = 'move';
    setDraggedCourseId(courseId);
    setDragSource(source);
  };

  const handleDragEnd = () => {
    setDraggedCourseId(null);
    setDragSource(null);
    setIsBoardDragging(false);
    setIsWaitingDrop(false);
  };

  const handleUnplaceCourse = (courseId: string) => {
    const next = selectedIds.filter((id) => id !== courseId);
    setSelectedIds(next);
    saveSelectedTimetableIds(next);
  };

  const handleBoardDrop = () => {
    if (!draggedCourseId) {
      return;
    }

    if (previewConflicts) {
      setIsBoardRejected(true);
      setIsBoardDragging(false);
      setTimeout(() => setIsBoardRejected(false), 450);
      toast.error('시간이 겹쳐서 이 위치에는 올릴 수 없어요.');
      return;
    }

    if (!selectedIds.includes(draggedCourseId)) {
      const next = [...selectedIds, draggedCourseId];
      setSelectedIds(next);
      saveSelectedTimetableIds(next);
      toast.success('시간표 보드에 블록을 올렸어요.');
      setRecentlyPlacedCourseId(draggedCourseId);
      setTimeout(() => setRecentlyPlacedCourseId(null), 420);
    }

    setDraggedCourseId(null);
    setDragSource(null);
    setIsBoardDragging(false);
  };

  const handleWaitingDrop = () => {
    if (!draggedCourseId || dragSource !== 'board') {
      setIsWaitingDrop(false);
      return;
    }

    handleUnplaceCourse(draggedCourseId);
    setDraggedCourseId(null);
    setDragSource(null);
    setIsWaitingDrop(false);
    toast.success('강의를 대기 영역으로 되돌렸어요.');
  };

  const handleRemoveFromCart = (courseId: string) => {
    const nextCartIds = cartIds.filter((id) => id !== courseId);
    const nextSelectedIds = selectedIds.filter((id) => id !== courseId);
    setCartIds(nextCartIds);
    setSelectedIds(nextSelectedIds);
    saveTimetableCartIds(nextCartIds);
    saveSelectedTimetableIds(nextSelectedIds);
  };

  const handlePlaceAll = () => {
    const nextSelectedIds = cartCourses.map((course) => course.id);
    setSelectedIds(nextSelectedIds);
    saveSelectedTimetableIds(nextSelectedIds);
  };

  const handleClearPlaced = () => {
    setSelectedIds([]);
    saveSelectedTimetableIds([]);
  };

  return (
    <div className="min-h-screen">
      <div className="page-shell flex flex-col gap-4 py-6 xl:h-[calc(100vh-92px)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#005bac]">시간표</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">블록 시간표</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-600 shadow-sm">
              장바구니 {cartCourses.length}
            </Badge>
            <Badge className="rounded-full bg-[#edf4ff] px-3 py-1.5 text-xs font-black text-[#005bac]">
              배치 {placedCourses.length}
            </Badge>
            <Badge className={`rounded-full px-3 py-1.5 text-xs font-black ${conflicts.length > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {conflicts.length > 0 ? `충돌 ${conflicts.length}` : `학점 ${totalCredits}`}
            </Badge>
            <Link to="/search">
              <Button variant="outline" className="rounded-full px-4 font-bold">
                강의 담기
              </Button>
            </Link>
            <Button onClick={handlePlaceAll} className="rounded-full px-4 font-bold text-white">
              전체 배치
            </Button>
            <Button variant="ghost" onClick={handleClearPlaced} className="rounded-full px-4 font-bold text-slate-500">
              초기화
            </Button>
          </div>
        </div>

        <div className="grid flex-1 gap-5 xl:min-h-0 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Card
            className={`overflow-hidden rounded-[2.25rem] border bg-white shadow-[0_18px_44px_rgba(15,23,42,0.08)] transition-all ${
              isBoardRejected
                ? 'border-rose-300 bg-rose-50/60 ring-2 ring-rose-200'
                : isBoardDragging
                  ? previewConflicts
                    ? 'border-rose-300 bg-rose-50/50'
                    : 'border-[#005bac]/22 bg-[#f8fbfd]'
                  : 'border-[rgba(15,23,42,0.08)]'
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
            <CardContent className="flex h-full min-h-[760px] flex-col p-5 xl:min-h-0">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#005bac]">주간 시간표</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">드래그해서 시간표에 배치하기</h2>
                  {draggedCourse && (
                    <p className={`mt-2 text-sm font-bold ${previewConflicts ? 'text-rose-600' : 'text-[#1084e8]'}`}>
                      {previewConflicts ? `${draggedCourse.name} 시간 충돌` : `${draggedCourse.name} 배치 가능`}
                    </p>
                  )}
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-[#005bac]">
                  <CalendarClock className="h-5 w-5" />
                </div>
              </div>

              <div className="min-h-0 overflow-x-auto xl:overflow-hidden">
                <div className="grid min-w-[980px] grid-cols-[96px_repeat(5,minmax(0,1fr))] gap-3 xl:min-w-0">
                  <div />
                  {TIMETABLE_DAYS.map((day) => (
                    <div
                      key={day}
                      className="flex h-14 items-center justify-center rounded-full border border-[rgba(15,23,42,0.08)] bg-[#f5f8fc] text-2xl font-black text-slate-700"
                    >
                      {day}
                    </div>
                  ))}

                  <div className="relative" style={{ height: boardHeight }}>
                    {displayedPeriods.map((period) => (
                      <div
                        key={`label-${period.period}`}
                        className="absolute left-0 right-0 flex flex-col items-center justify-center rounded-[1.35rem] border border-[rgba(15,23,42,0.08)] bg-white/88 text-center shadow-sm"
                        style={{ top: getRowTop(period.period) }}
                      >
                        <div
                          className="flex w-full flex-col items-center justify-center"
                          style={{ height: rowHeight }}
                        >
                          <p className="text-[11px] font-semibold tracking-tight text-slate-400">{period.label}</p>
                          <p className="text-base font-extrabold tracking-tight text-slate-700">{period.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {dayColumns.map((column) => (
                    <div
                      key={column.day}
                      className="relative overflow-hidden rounded-[2rem] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,#fbfdff_0%,#f6f9fe_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
                      style={{ height: boardHeight }}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,132,232,0.07),transparent_55%)]" />

                      {displayedPeriods.slice(0, -1).map((period) => (
                        <div
                          key={`${column.day}-line-${period.period}`}
                          className="absolute left-0 right-0 h-px bg-[#dde6f2]"
                          style={{ top: getRowTop(period.period) + rowHeight + rowGap / 2 }}
                        />
                      ))}

                      {draggedCourse &&
                        previewEntries
                          .filter((entry) => entry.day === column.day)
                          .map((entry) => {
                            const frame = getEntryFrame(entry.startPeriod, entry.endPeriod);

                            return (
                              <div
                                key={`preview-${entry.courseId}-${entry.day}-${entry.startPeriod}`}
                                className={`pointer-events-none absolute left-0 right-0 rounded-none border-2 border-dashed px-3 py-3 ${
                                  previewConflicts
                                    ? 'border-rose-300 bg-rose-100/70'
                                    : 'border-[#1084e8] bg-[#dff1ff]/75'
                                }`}
                                style={frame}
                              >
                                <p className={`line-clamp-2 text-sm font-black ${previewConflicts ? 'text-rose-600' : 'text-[#005bac]'}`}>
                                  {entry.courseName}
                                </p>
                              </div>
                            );
                          })}

                      {column.entries.map((entry) => {
                        const frame = getEntryFrame(entry.startPeriod, entry.endPeriod);

                        return (
                          <div
                            key={`${entry.courseId}-${entry.day}-${entry.startPeriod}`}
                            draggable
                            onDragStart={(event) => handleDragStart(event, entry.courseId, 'board')}
                            onDragEnd={handleDragEnd}
                            className={`absolute left-0 right-0 cursor-grab rounded-none border bg-gradient-to-br px-3 py-3 shadow-[0_10px_18px_rgba(15,23,42,0.08)] transition-transform active:cursor-grabbing ${getBlockStyle(entry.courseId)} ${
                              recentlyPlacedCourseId === entry.courseId ? 'scale-[1.02] animate-[pulse_350ms_ease-out_1]' : ''
                            }`}
                            style={frame}
                          >
                            <div className="flex h-full flex-col justify-between">
                              <div>
                                <p className="line-clamp-2 text-[15px] font-black leading-tight">{entry.courseName}</p>
                                <p className="mt-1 line-clamp-1 text-xs font-semibold opacity-75">{entry.professor}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[11px] font-black opacity-80">
                                  {displayedPeriods[entry.startPeriod - 1]?.time} - {displayedPeriods[entry.endPeriod]?.time ?? `${String(9 + entry.endPeriod).padStart(2, '0')}:00`}
                                </p>
                                <p className="line-clamp-1 text-[11px] font-medium opacity-75">{entry.location}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 xl:min-h-0">
            <Card
              className={`rounded-[2rem] border bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition-all ${
                isWaitingDrop
                  ? 'border-[#005bac]/30 bg-[#f8fbfd] ring-2 ring-[#005bac]/10'
                  : 'border-[rgba(15,23,42,0.08)]'
              }`}
              onDragOver={(event) => {
                if (dragSource === 'board') {
                  event.preventDefault();
                  setIsWaitingDrop(true);
                }
              }}
              onDragLeave={(event) => {
                const nextTarget = event.relatedTarget as Node | null;
                if (!event.currentTarget.contains(nextTarget)) {
                  setIsWaitingDrop(false);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                handleWaitingDrop();
              }}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#005bac]">대기 구역</p>
                    <h3 className="mt-1 text-xl font-black text-slate-950">대기 구역</h3>
                  </div>
                  <Badge className="rounded-full bg-[#edf4ff] px-3 py-1.5 text-xs font-black text-[#005bac]">
                    {unplacedCourses.length}
                  </Badge>
                </div>
                <p className={`mt-2 text-sm font-medium ${isWaitingDrop ? 'text-[#1084e8]' : 'text-slate-500'}`}>
                  {isWaitingDrop ? '여기에 놓으면 보드에서 빠집니다.' : '보드 블록을 끌어오면 대기 상태로 돌아갑니다.'}
                </p>
              </CardContent>
            </Card>

            {conflicts.length > 0 && (
              <Card className="rounded-[2rem] border border-rose-200 bg-rose-50 shadow-none">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-rose-700">
                    <AlertTriangle className="h-4 w-4" />
                    <p className="font-black">시간 충돌</p>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm font-medium text-rose-700">
                    {conflicts.slice(0, 4).map((conflict) => (
                      <li key={conflict}>{conflict}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card className="rounded-[2rem] border border-[rgba(15,23,42,0.08)] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)] xl:flex xl:min-h-0 xl:flex-col">
              <CardContent className="flex flex-col p-5 xl:min-h-0">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#005bac]">담은 강의</p>
                    <h3 className="mt-1 text-xl font-black text-slate-950">배치할 블록</h3>
                  </div>
                  <Badge className="rounded-full bg-[#edf4ff] px-3 py-1.5 text-xs font-black text-[#005bac]">
                    {unplacedCourses.length}개
                  </Badge>
                </div>

                <div className="space-y-3 xl:min-h-0 xl:overflow-y-auto xl:pr-1">
                  {isLoading ? (
                    <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-400">
                      불러오는 중
                    </div>
                  ) : unplacedCourses.length === 0 ? (
                    <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                      <p className="font-bold text-slate-500">대기 중인 강의가 없습니다.</p>
                    </div>
                  ) : (
                    unplacedCourses.map((course) => (
                      <div
                        key={course.id}
                        draggable
                        onDragStart={(event) => handleDragStart(event, course.id, 'cart')}
                        onDragEnd={handleDragEnd}
                        className={`rounded-[1.5rem] border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 ${
                          draggedCourseId === course.id
                            ? 'scale-[1.02] border-[#1084e8] shadow-[0_20px_36px_rgba(16,132,232,0.18)]'
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex h-3 w-3 rounded-full bg-gradient-to-br ${getBlockStyle(course.id).split(' ')[0]} ${getBlockStyle(course.id).split(' ')[1]}`} />
                              <p className="line-clamp-1 text-base font-black text-slate-900">{course.name}</p>
                            </div>
                            <p className="mt-1 text-sm font-medium text-slate-500">{course.professor} 교수님</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {course.slots.map((slot) => (
                                <span key={`${course.id}-${slot.day}-${slot.startPeriod}`} className="rounded-full bg-[#edf4ff] px-3 py-1 text-[11px] font-bold text-[#005bac]">
                                  {slot.day} {slot.startPeriod}-{slot.endPeriod}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button onClick={() => handlePlaceCourse(course.id)} className="rounded-full px-4 text-xs font-bold text-white">
                              <Plus className="mr-1 h-3.5 w-3.5" />
                              올리기
                            </Button>
                            <Button variant="outline" onClick={() => handleRemoveFromCart(course.id)} className="rounded-full px-4 text-xs font-bold">
                              <Trash2 className="mr-1 h-3.5 w-3.5" />
                              제거
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {placedCourses.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {placedCourses.map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => handleUnplaceCourse(course.id)}
                    className="rounded-full border border-[#d7e7f6] bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:border-[#1084e8]/25 hover:text-[#005bac]"
                  >
                    {course.name}
                    <X className="ml-1 inline h-3 w-3" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
