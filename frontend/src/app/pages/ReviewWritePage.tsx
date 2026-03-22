import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { Star, Loader2, AlertCircle, Activity, X, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';
import { courseService, reviewService, userService } from '../api/api';
import { Course } from '../types/types';
import { toast } from 'sonner';
import { buildSemesterOptions } from '../lib/semester';

const examTypeOptions = ['객관식', '단답형', '주관식/서술형', '오픈북', '과제 대체', '실습/발표', '조별 발표', '코드 짜기'];
const pastExamHelpfulnessOptions = ['거의 없음', '조금 도움', '꽤 도움', '거의 필수'];
const scopePredictabilityOptions = ['예고 거의 그대로', '대체로 비슷', '꽤 달라짐', '예측 어려움'];
const studyResourceOptions = ['교수님 PPT', '수업 필기', '과제/실습', '교재', '족보'];
const recommendOptions = ['벼락치기 가능', '성실한 출석러', '팀플/발표 선호'];
const notRecommendOptions = ['암기 취약', '팀플 극혐', '발표 공포증'];

export function ReviewWritePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const availableSemesters = useMemo(() => buildSemesterOptions(2024, 1), []);

  // 기본 항목
  const [semester, setSemester] = useState(() => {
    const requestedSemester = searchParams.get('semester');
    if (requestedSemester && availableSemesters.includes(requestedSemester)) {
      return requestedSemester;
    }
    return availableSemesters[0] ?? '2024-1학기';
  });
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [workload, setWorkload] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [attendance, setAttendance] = useState<'strict' | 'medium' | 'flexible'>('medium');
  const [grading, setGrading] = useState<'generous' | 'medium' | 'strict'>('medium');

  // 육각형 지표 스탯 (1~5)
  const [diffScore, setDiffScore] = useState(3);
  const [teachingScore, setTeachingScore] = useState(3);
  const [gradScore, setGradScore] = useState(3);
  const [workScore, setWorkScore] = useState(3);
  const [prerequisiteScore, setPrerequisiteScore] = useState(3);
  const [depthScore, setDepthScore] = useState(3);
  const [timeInvestScore, setTimeInvestScore] = useState(3);
  const [attScore, setAttScore] = useState(3);
  const [pastExamScore, setPastExamScore] = useState(3);

  // 🔥 추가 항목
  const [examTypes, setExamTypes] = useState<string[]>([]);
  const [tempExamType, setTempExamType] = useState('');
  const [assignmentType, setAssignmentType] = useState<string>('개인 과제 위주');
  const [textbook, setTextbook] = useState<string>('참고용');
  const [pastExamHelpfulness, setPastExamHelpfulness] = useState<string>('');
  const [scopePredictability, setScopePredictability] = useState<string>('');
  const [studyResources, setStudyResources] = useState<string[]>([]);
  const [examPrepTip, setExamPrepTip] = useState('');
  const [recommendFor, setRecommendFor] = useState<string[]>([]);
  const [notRecommendFor, setNotRecommendFor] = useState<string[]>([]);
  const [tempRecommend, setTempRecommend] = useState('');
  const [tempNotRecommend, setTempNotRecommend] = useState('');

  const [content, setContent] = useState('');
  const [draggingMetric, setDraggingMetric] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<{ label: string; ratio: number } | null>(null);
  const metricPointerState = useRef<{ label: string | null; startX: number; active: boolean }>({
    label: null,
    startX: 0,
    active: false,
  });

  useEffect(() => {
    const fetchCourse = async () => {
      if (courseId) {
        try {
          const data = await courseService.getCourseById(courseId);
          setCourse(data || null);
        } catch (error) {
          console.error("Failed to fetch course", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    if (!availableSemesters.includes(semester)) {
      setSemester(availableSemesters[0] ?? '2024-1학기');
    }
  }, [availableSemesters, semester]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">강의를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // 다중 선택 핸들러
  const toggleSelection = (item: string, state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (state.includes(item)) {
      setState(state.filter(i => i !== item));
    } else {
      setState([...state, item]);
    }
  };

  const addExamType = () => {
    const value = tempExamType.trim();
    if (value && !examTypes.includes(value)) {
      setExamTypes([...examTypes, value]);
      setTempExamType('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('별점을 선택해주세요');
      return;
    }

    if (content.length < 30) {
      toast.error('후기는 최소 30자 이상 작성해주세요');
      return;
    }

    if (!pastExamHelpfulness || !scopePredictability || studyResources.length === 0) {
      toast.error('시험/족보 정보의 필수 항목을 모두 선택해주세요');
      return;
    }

    if (!courseId) return;

    setIsSubmitting(true);
    try {
      // API call includes the new fields (requires backend update eventually)
      await reviewService.createReview({
        courseId,
        semester,
        rating,
        difficulty,
        workload,
        attendance,
        grading,
        content,
        isAnonymous: true,
        diffScore,
        teachingScore,
        gradScore,
        workScore,
        prerequisiteScore,
        depthScore,
        timeInvestScore,
        attScore,
        pastExamScore,
        examTypes,
        assignmentType,
        textbook,
        pastExamHelpfulness,
        scopePredictability,
        studyResources,
        examPrepTip,
        recommendFor,
        notRecommendFor,
      });

      try {
        await userService.addPoints(
          totalReward,
          bonusReward > 0 ? '상세 강의평 작성 + 추가 정보 보너스' : '상세 강의평 작성',
        );
      } catch {
        // Ignore point refresh failures so successful review submission isn't blocked.
      }

      toast.success('강의평이 등록되었습니다. 포인트는 마이페이지에서 확인해주세요.');
      setTimeout(() => {
        navigate(`/course/${courseId}`);
      }, 1000);
    } catch (error) {
      toast.error('리뷰 등록 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating || rating;
  const isMajor = course?.category === '전공';
  const ratingFeedback = ['아쉬워요', '그저 그래요', '무난해요', '좋았어요', '훌륭해요'];
  const baseReward = 10;
  const hasRequiredExamInfo = Boolean(pastExamHelpfulness) && Boolean(scopePredictability) && studyResources.length > 0;
  const hasExamPrepBonus = examPrepTip.trim().length >= 30;
  const bonusRewardItems = [
    { label: '시험 대비 팁', earned: hasExamPrepBonus, points: 5 },
    { label: '추천해요', earned: recommendFor.length > 0, points: 5 },
    { label: '비추천 대상', earned: notRecommendFor.length > 0, points: 5 },
  ];
  const bonusReward = bonusRewardItems.filter((item) => item.earned).reduce((sum, item) => sum + item.points, 0);
  const totalReward = baseReward + bonusReward;
  const hasContentRequirement = content.trim().length >= 30;
  const missingRequiredItems = [
    rating === 0 ? '별점 선택' : null,
    !hasRequiredExamInfo ? '시험/족보 정보' : null,
    !hasContentRequirement ? '총평 30자 이상' : null,
  ].filter(Boolean) as string[];
  const earnedBonusItems = bonusRewardItems.filter((item) => item.earned);
  const isReadyToSubmit = rating > 0 && hasContentRequirement && hasRequiredExamInfo;
  const submitTone =
    !isReadyToSubmit
      ? 'bg-slate-200 text-slate-500 shadow-none hover:bg-slate-200'
      : earnedBonusItems.length === 0
        ? 'bg-[#dbe9fb] text-[#005bac] shadow-none hover:bg-[#cfe2fb]'
        : earnedBonusItems.length === 1
          ? 'bg-[#bdd8f8] text-[#005bac] shadow-none hover:bg-[#b0d0f5]'
          : earnedBonusItems.length === 2
            ? 'bg-[#8fbbef] text-white shadow-[0_10px_24px_rgba(0,91,172,0.14)] hover:bg-[#84b4eb]'
            : 'bg-[#5e98e5] text-white shadow-[0_12px_28px_rgba(0,91,172,0.18)] hover:bg-[#4f8bdd]';

  const majorMetrics = [
    { label: '시험 난이도', value: diffScore, setter: setDiffScore, options: ['쉬움', '조금 쉬움', '보통', '어려움', '매우 어려움'] },
    { label: '강의력', value: teachingScore, setter: setTeachingScore, options: ['아쉬움', '무난함', '좋음', '매우 좋음', '압도적'] },
    { label: '학점 비율', value: gradScore, setter: setGradScore, options: ['짜게줌', '조금 짬', '보통', '잘 주는 편', '매우 후함'] },
    { label: '과제량', value: workScore, setter: setWorkScore, options: ['거의 없음', '적은 편', '보통', '많은 편', '매우 많음'] },
    { label: '선수지식 필요도', value: prerequisiteScore, setter: setPrerequisiteScore, options: ['거의 없음', '조금 필요', '어느 정도', '필요함', '필수적임'] },
    { label: '전공 심화도', value: depthScore, setter: setDepthScore, options: ['가볍게', '기초 위주', '보통', '깊게', '매우 깊게'] },
  ];

  const generalMetrics = [
    { label: '시험 난이도', value: diffScore, setter: setDiffScore, options: ['쉬움', '조금 쉬움', '보통', '어려움', '매우 어려움'] },
    { label: '시간 투자', value: timeInvestScore, setter: setTimeInvestScore, options: ['거의 없음', '적은 편', '보통', '많은 편', '매우 많음'] },
    { label: '학점 비율', value: gradScore, setter: setGradScore, options: ['짜게줌', '조금 짬', '보통', '잘 주는 편', '매우 후함'] },
    { label: '과제량', value: workScore, setter: setWorkScore, options: ['거의 없음', '적은 편', '보통', '많은 편', '매우 많음'] },
    { label: '출석체크', value: attScore, setter: setAttScore, options: ['엄격함', '자주 확인', '보통', '가끔 확인', '자유로움'] },
    { label: '족보 유효도', value: pastExamScore, setter: setPastExamScore, options: ['거의 없음', '조금 도움', '보통', '꽤 도움', '많이 도움'] },
  ];

  const currentMetrics = isMajor ? majorMetrics : generalMetrics;
  const getMetricOption = (value: number, options: string[]) => options[Math.max(0, Math.min(options.length - 1, Math.round(value) - 1))];
  const resolveMetricRatioFromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  };
  const resolveMetricValueFromRatio = (ratio: number) => Math.min(5, Math.max(1, Math.round(ratio * 4) + 1));

  return (
    <div className="min-h-screen py-8 pb-20">
      <div className="page-shell max-w-[920px]">
        <div className="page-panel rounded-[1.75rem] p-5 md:p-7">
          <div className="mb-7">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#005bac]">Review</p>
          </div>

          <div className="mb-7 border-b border-gray-100 pb-5">
            <h2 className="text-[1.75rem] font-black tracking-tight text-gray-900 md:text-[2rem]">{course.name}</h2>
            <p className="text-gray-500 mt-1">
              {course.professor} 교수님 · {course.department}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 기본 정보 섹션 */}
            <div className="space-y-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                <div className="space-y-3 flex-1">
                  <Label className="text-base font-semibold">실제로 수강한 학기</Label>
                  <Select value={semester} onValueChange={setSemester}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSemesters.map((sem) => (
                        <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs font-medium text-slate-500">2024-1학기부터의 수강 기록만 남길 수 있습니다.</p>
                </div>

                <div className="flex-1 space-y-3">
                  <Label className="text-base font-semibold">전체 별점</Label>
                  <div className="pt-2" onMouseLeave={() => setHoveredRating(0)}>
                    <div className="flex items-center gap-3">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <div key={value} className="relative flex cursor-pointer">
                          <Star
                            className={`h-11 w-11 transition-all duration-150 ${
                              value <= Math.floor(displayRating)
                                ? 'fill-[#f2ba2f] text-[#f2ba2f] drop-shadow-[0_4px_10px_rgba(242,186,47,0.22)]'
                                : 'text-slate-200 hover:text-slate-300'
                            }`}
                          />
                          {displayRating === value - 0.5 && (
                            <div className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden" style={{ width: '50%' }}>
                              <Star className="h-11 w-11 fill-[#f2ba2f] text-[#f2ba2f] drop-shadow-[0_4px_10px_rgba(242,186,47,0.18)]" />
                            </div>
                          )}
                          <div
                            className="absolute left-0 top-0 z-10 h-full w-1/2"
                            onClick={() => setRating(value - 0.5)}
                            onMouseEnter={() => setHoveredRating(value - 0.5)}
                            aria-hidden="true"
                          />
                          <div
                            className="absolute right-0 top-0 z-10 h-full w-1/2"
                            onClick={() => setRating(value)}
                            onMouseEnter={() => setHoveredRating(value)}
                            aria-hidden="true"
                          />
                        </div>
                      ))}
                      {rating > 0 && (
                        <span className="ml-1 text-sm font-semibold text-slate-500">
                          {ratingFeedback[Math.max(0, Math.ceil(rating) - 1)]}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 h-px w-full bg-[linear-gradient(90deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.04)_100%)]" />
                    <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                      <span>아쉬움</span>
                      <span>훌륭함</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 🌟 육각형 지표 평가 (1~5점) */}
              <div className="pt-2 space-y-3">
                <Label className="flex items-center gap-2 text-base font-bold text-gray-900">
                  <Activity className="w-5 h-5 text-[#005bac]" />
                  상세 지표
                </Label>
                <div className="rounded-[1.25rem] border border-[rgba(15,23,42,0.08)] bg-[#fbfcfd] p-4">
                  <div className="mb-4 flex items-center justify-between gap-3 border-b border-[rgba(15,23,42,0.08)] pb-3">
                    <p className="text-sm font-medium text-slate-500">클릭하거나 쓸어 조절하면 가장 가까운 단계로 고정됩니다.</p>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-500">5단계</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {currentMetrics.map((metric) => {
                      const selectedLabel = getMetricOption(metric.value, metric.options);
                      const currentRatio =
                        dragPreview?.label === metric.label ? dragPreview.ratio : (metric.value - 1) / 4;
                      const isDraggingCurrentMetric = draggingMetric === metric.label;

                      return (
                        <div key={metric.label} className="rounded-[1rem] border border-[rgba(15,23,42,0.08)] bg-white p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <Label className="text-sm font-black text-slate-900">{metric.label}</Label>
                              <p className="mt-1 text-[11px] font-medium text-slate-500">{metric.options[0]} - {metric.options[4]}</p>
                            </div>
                            <span className="rounded-full bg-[#f3f7fc] px-2.5 py-1 text-[11px] font-black text-[#005bac]">
                              {selectedLabel}
                            </span>
                          </div>

                          <div className="mt-3 px-1 py-1">
                            <div className="mb-2 flex items-center justify-between text-[10px] font-black text-slate-400">
                              <span>{metric.options[0]}</span>
                              <span>{metric.options[4]}</span>
                            </div>

                            <div
                              className="relative flex items-center gap-1 rounded-full bg-slate-100 p-1 touch-none select-none"
                              onPointerDown={(event) => {
                                metricPointerState.current = {
                                  label: metric.label,
                                  startX: event.clientX,
                                  active: true,
                                };
                              }}
                              onPointerMove={(event) => {
                                if (!metricPointerState.current.active || metricPointerState.current.label !== metric.label) {
                                  return;
                                }

                                const movedEnough = Math.abs(event.clientX - metricPointerState.current.startX) > 6;
                                if (movedEnough) {
                                  if (draggingMetric !== metric.label) {
                                    setDraggingMetric(metric.label);
                                  }
                                  setDragPreview({
                                    label: metric.label,
                                    ratio: resolveMetricRatioFromPointer(event),
                                  });
                                }
                              }}
                              onPointerUp={() => {
                                if (draggingMetric === metric.label) {
                                  const finalRatio = dragPreview?.label === metric.label ? dragPreview.ratio : (metric.value - 1) / 4;
                                  metric.setter(resolveMetricValueFromRatio(finalRatio));
                                }
                                metricPointerState.current = { label: null, startX: 0, active: false };
                                setDraggingMetric(null);
                                setDragPreview(null);
                              }}
                              onPointerCancel={() => {
                                metricPointerState.current = { label: null, startX: 0, active: false };
                                setDraggingMetric(null);
                                setDragPreview(null);
                              }}
                              onLostPointerCapture={() => {
                                if (draggingMetric === metric.label) {
                                  const finalRatio = dragPreview?.label === metric.label ? dragPreview.ratio : (metric.value - 1) / 4;
                                  metric.setter(resolveMetricValueFromRatio(finalRatio));
                                }
                                metricPointerState.current = { label: null, startX: 0, active: false };
                                setDraggingMetric(null);
                                setDragPreview(null);
                              }}
                            >
                              <div
                                  className={`pointer-events-none absolute bottom-1 top-1 rounded-full bg-[#005bac] ${
                                    isDraggingCurrentMetric ? 'transition-none' : 'transition-[left] duration-100 ease-out'
                                  }`}
                                style={{
                                  width: 'calc((100% - 8px) / 5)',
                                  left: `calc(4px + ((100% - 8px - ((100% - 8px) / 5)) * ${currentRatio}))`,
                                }}
                              />
                              {metric.options.map((option, index) => {
                                const value = index + 1;
                                const isSelected = resolveMetricValueFromRatio(currentRatio) === value;

                                return (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() => {
                                      metric.setter(value);
                                      metricPointerState.current = { label: null, startX: 0, active: false };
                                      setDragPreview(null);
                                      setDraggingMetric(null);
                                    }}
                                    className={`relative z-10 min-w-0 flex-1 rounded-full px-0 py-2.5 text-center transition-all ${
                                      isSelected ? 'text-white' : 'text-slate-400 hover:text-slate-700'
                                    }`}
                                    aria-label={`${metric.label} ${option}`}
                                  >
                                    <span className="block text-sm font-black">
                                      {value}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 시험 방식 (다중 선택) */}
            <div className="space-y-3 border-t border-slate-100 pt-5">
              <Label className="text-base font-semibold text-gray-800">시험 방식 (다중 선택 가능)</Label>
              <div className="flex flex-wrap gap-2">
                {examTypeOptions.map((item) => {
                  const isChecked = examTypes.includes(item);
                    return (
                    <label key={item} className={`flex cursor-pointer items-center rounded-full border px-3.5 py-2 text-sm transition-all ${isChecked ? 'border-[#005bac] bg-[#edf4ff] text-[#005bac]' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                      <Checkbox
                        className="sr-only"
                        checked={isChecked}
                        onCheckedChange={() => toggleSelection(item, examTypes, setExamTypes)}
                      />
                      {item}
                    </label>
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                {examTypes.filter(item => !examTypeOptions.includes(item)).map(item => (
                  <span key={item} className="flex items-center gap-1 rounded-full border border-[rgba(15,23,42,0.08)] bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600">
                    {item}
                    <button type="button" onClick={() => toggleSelection(item, examTypes, setExamTypes)}>
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="시험 방식을 직접 추가"
                  value={tempExamType}
                  onChange={(e) => setTempExamType(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addExamType();
                    }
                  }}
                  className="rounded-xl border-slate-200 bg-white text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addExamType}
                  className="h-10 shrink-0 rounded-xl px-3 text-sm font-semibold"
                >
                  추가
                </Button>
              </div>
            </div>

            {/* 과제 유형 */}
            <div className="space-y-3 pt-2">
              <Label className="text-base font-semibold text-gray-800">과제 및 팀플 비중</Label>
              <RadioGroup value={assignmentType} onValueChange={setAssignmentType} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['개인 과제 위주', '팀플 위주', '초반에만 있음', '과제 없음'].map((item) => (
                  <div key={item}>
                    <RadioGroupItem value={item} id={`assign-${item}`} className="peer sr-only" />
                    <Label htmlFor={`assign-${item}`} className="flex justify-center rounded-xl border p-3 text-sm cursor-pointer peer-data-[state=checked]:border-[#005bac] peer-data-[state=checked]:bg-[#edf4ff] peer-data-[state=checked]:text-[#005bac] hover:bg-gray-50">
                      {item}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* 교재 사용 */}
            <div className="space-y-3 pt-2">
              <Label className="text-base font-semibold text-gray-800">교재 사용도</Label>
              <RadioGroup value={textbook} onValueChange={setTextbook} className="grid grid-cols-2 gap-3">
                {['무조건 사야함 (필수)', '참고용', '교수님 PPT 위주', '거의 안 씀'].map((item) => (
                  <div key={item}>
                    <RadioGroupItem value={item} id={`book-${item}`} className="peer sr-only" />
                    <Label htmlFor={`book-${item}`} className="flex justify-center rounded-xl border p-3 text-sm cursor-pointer peer-data-[state=checked]:border-[#005bac] peer-data-[state=checked]:bg-[#edf4ff] peer-data-[state=checked]:text-[#005bac] hover:bg-gray-50">
                      {item}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* 추천 대상 */}
            <div className="grid grid-cols-1 gap-5 pt-2 md:grid-cols-2">
              <div className="flex h-full flex-col rounded-[1.2rem] border border-[rgba(15,23,42,0.08)] bg-white p-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Label className="text-sm font-black text-[#177245] flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" />
                      추천해요
                    </Label>
                    <span className="rounded-full border border-[#dcefe4] bg-[#f4fcf7] px-3 py-1 text-[11px] font-black text-[#177245]">작성 시 +5P</span>
                  </div>
                  <p className="text-xs font-medium text-slate-500">잘 맞는 수강생 유형을 간단히 남겨둘 수 있습니다.</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                      {recommendOptions.map((item) => (
                        <label key={item} className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-bold transition-all ${recommendFor.includes(item) ? 'border-[#177245] bg-[#eef8f1] text-[#177245]' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                          <Checkbox className="sr-only" checked={recommendFor.includes(item)} onCheckedChange={() => toggleSelection(item, recommendFor, setRecommendFor)} />
                          {item}
                        </label>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                      {recommendFor.filter(item => !recommendOptions.includes(item)).map(item => (
                        <span key={item} className="flex items-center gap-1 rounded-full border border-[#c9efd9] bg-[#f4fcf7] px-2.5 py-1 text-[11px] font-bold text-[#177245]">
                          {item}
                          <button type="button" onClick={() => toggleSelection(item, recommendFor, setRecommendFor)}><X className="w-2.5 h-2.5" /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="추천 대상을 직접 추가"
                      value={tempRecommend}
                      onChange={(e) => setTempRecommend(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (tempRecommend.trim()) {
                            toggleSelection(tempRecommend.trim(), recommendFor, setRecommendFor);
                            setTempRecommend('');
                          }
                        }
                      }}
                      className="rounded-xl border-slate-200 bg-white text-sm focus:border-[#177245] focus:ring-[#177245]"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (tempRecommend.trim()) {
                          toggleSelection(tempRecommend.trim(), recommendFor, setRecommendFor);
                          setTempRecommend('');
                        }
                      }}
                      className="h-10 w-10 shrink-0 rounded-xl bg-[#177245] p-0 text-white hover:bg-[#135e3a]"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex h-full flex-col space-y-3 rounded-[1.2rem] border border-[rgba(15,23,42,0.08)] bg-white p-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Label className="text-sm font-black text-[#c43b3b] flex items-center gap-1.5">
                      <X className="w-3.5 h-3.5" />
                      비추천 대상
                    </Label>
                    <span className="rounded-full border border-[#f0dddd] bg-[#fff6f6] px-3 py-1 text-[11px] font-black text-[#c43b3b]">작성 시 +5P</span>
                  </div>
                  <p className="text-xs font-medium text-slate-500">미리 알고 들어가면 좋은 유형도 함께 정리할 수 있습니다.</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                      {notRecommendOptions.map((item) => (
                        <label key={item} className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-bold transition-all ${notRecommendFor.includes(item) ? 'border-[#c43b3b] bg-[#fff2f2] text-[#c43b3b]' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                          <Checkbox className="sr-only" checked={notRecommendFor.includes(item)} onCheckedChange={() => toggleSelection(item, notRecommendFor, setNotRecommendFor)} />
                          {item}
                        </label>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                      {notRecommendFor.filter(item => !notRecommendOptions.includes(item)).map(item => (
                        <span key={item} className="flex items-center gap-1 rounded-full border border-[#f3d4d4] bg-[#fff6f6] px-2.5 py-1 text-[11px] font-bold text-[#c43b3b]">
                          {item}
                          <button type="button" onClick={() => toggleSelection(item, notRecommendFor, setNotRecommendFor)}><X className="w-2.5 h-2.5" /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-1">
                  <div className="flex gap-2">
                    <Input
                      placeholder="비추천 대상을 직접 추가"
                      value={tempNotRecommend}
                      onChange={(e) => setTempNotRecommend(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (tempNotRecommend.trim()) {
                            toggleSelection(tempNotRecommend.trim(), notRecommendFor, setNotRecommendFor);
                            setTempNotRecommend('');
                          }
                        }
                      }}
                      className="rounded-xl border-slate-200 bg-white text-sm focus:border-[#c43b3b] focus:ring-[#c43b3b]"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (tempNotRecommend.trim()) {
                          toggleSelection(tempNotRecommend.trim(), notRecommendFor, setNotRecommendFor);
                          setTempNotRecommend('');
                        }
                      }}
                      className="h-10 w-10 shrink-0 rounded-xl bg-[#c43b3b] p-0 text-white hover:bg-[#ad3232]"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 🔥 추가 시험 / 족보 정보 (Accordion) */}
            <Accordion type="single" collapsible className="mt-2 w-full overflow-hidden rounded-[1.2rem] border border-[rgba(15,23,42,0.08)]">
              <AccordionItem value="exam-info" className="border-b-0">
                <AccordionTrigger className="border-b border-[rgba(15,23,42,0.08)] bg-[#f8fafc] px-5 py-4 font-bold text-slate-800 transition-colors hover:bg-slate-100">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-[#005bac]" />
                    시험/족보 정보
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-white px-5 py-5">
                  <div className="space-y-6">
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-3 rounded-[1rem] bg-[#fbfcff] px-1 py-1">
                        <Label className="text-sm font-bold text-slate-800">족보 도움됨 정도</Label>
                        <RadioGroup value={pastExamHelpfulness} onValueChange={setPastExamHelpfulness} className="grid grid-cols-2 gap-2">
                          {pastExamHelpfulnessOptions.map((item) => (
                            <div key={item}>
                              <RadioGroupItem value={item} id={`exam-help-${item}`} className="peer sr-only" />
                              <Label htmlFor={`exam-help-${item}`} className="flex justify-center rounded-xl border p-3 text-sm cursor-pointer peer-data-[state=checked]:border-[#005bac] peer-data-[state=checked]:bg-[#eef4ff] peer-data-[state=checked]:text-[#005bac] hover:bg-gray-50">
                                {item}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="space-y-3 border-t border-slate-100 bg-[#fcfdff] px-1 py-1 pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-1">
                        <Label className="text-sm font-bold text-slate-800">시험 범위 예측 가능성</Label>
                        <RadioGroup value={scopePredictability} onValueChange={setScopePredictability} className="grid grid-cols-2 gap-2">
                          {scopePredictabilityOptions.map((item) => (
                            <div key={item}>
                              <RadioGroupItem value={item} id={`scope-${item}`} className="peer sr-only" />
                              <Label htmlFor={`scope-${item}`} className="flex justify-center rounded-xl border p-3 text-sm cursor-pointer peer-data-[state=checked]:border-[#005bac] peer-data-[state=checked]:bg-[#eef4ff] peer-data-[state=checked]:text-[#005bac] hover:bg-gray-50">
                                {item}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-slate-100 pt-5">
                      <Label className="text-sm font-bold text-slate-800">주요 공부 자료</Label>
                      <div className="flex flex-wrap gap-2">
                        {studyResourceOptions.map((item) => {
                          const isChecked = studyResources.includes(item);
                          return (
                            <label key={item} className={`flex cursor-pointer items-center rounded-full border px-3.5 py-2 text-sm transition-all ${isChecked ? 'border-[#005bac] bg-[#eef4ff] text-[#005bac]' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                              <Checkbox
                                className="sr-only"
                                checked={isChecked}
                                onCheckedChange={() => toggleSelection(item, studyResources, setStudyResources)}
                              />
                              {item}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <Label className="text-sm font-bold text-slate-800">시험 대비 팁</Label>
                        <span className="rounded-full border border-[rgba(15,23,42,0.08)] bg-white px-2.5 py-1 text-[10px] font-black text-[#005bac]">30자 이상 작성 시 +5P</span>
                      </div>
                      <Textarea
                        value={examPrepTip}
                        onChange={(e) => setExamPrepTip(e.target.value)}
                        placeholder={'족보가 실제로 도움이 됐나요?\n어느 자료를 중심으로 공부하면 좋았나요?\n예상과 다르게 나온 부분이 있었나요?'}
                        className="min-h-[128px] resize-none rounded-xl border-gray-200 p-4 text-sm leading-relaxed"
                      />
                      <p className={`text-xs font-medium ${hasExamPrepBonus ? 'text-[#005bac]' : 'text-slate-400'}`}>
                        {examPrepTip.trim().length}/30자
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* 서술형 후기 */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <Label className="text-base font-semibold">총평 (최소 30자)</Label>
                <span className={`text-sm ${content.length < 30 ? 'text-red-500' : 'text-green-600 font-medium'}`}>
                  {content.length} / 30자 이상
                </span>
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="수업 방식, 과제나 시험 체감, 교수님 스타일, 후배에게 알려주고 싶은 점을 적어주세요."
                className="min-h-[160px] resize-none rounded-xl border-gray-200 p-4 text-base leading-relaxed"
              />
            </div>

            {/* 제출 버튼 */}
            <div className={`rounded-[1.2rem] border px-4 py-4 transition-colors ${isReadyToSubmit ? 'border-[rgba(0,91,172,0.12)] bg-[#f8fbff]' : 'border-[rgba(15,23,42,0.08)] bg-[#fbfcfe]'}`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#005bac]">포인트 안내</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">기본 10P + 선택 정보 보너스 최대 15P</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {missingRequiredItems.map((item) => (
                      <span key={item} className="rounded-full border border-[#f0d3d3] bg-[#fff3f3] px-3 py-1 text-[11px] font-bold text-[#c43b3b]">
                        {item} 필요
                      </span>
                    ))}
                    {earnedBonusItems.map((item) => (
                      <span key={item.label} className="rounded-full border border-[rgba(0,91,172,0.12)] bg-[#edf4ff] px-3 py-1 text-[11px] font-bold text-[#005bac]">
                        {item.label} +{item.points}P
                      </span>
                    ))}
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-black text-white">
                      현재 {totalReward}P
                    </span>
                  </div>
                </div>

                <Button type="submit" size="lg" disabled={isSubmitting || !isReadyToSubmit} className={`min-w-[220px] rounded-xl font-bold transition-all ${submitTone}`}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      제출 중...
                    </>
                  ) : (
                    `강의평 등록하기`
                  )}
                </Button>
              </div>
            </div>
            <p className="text-center text-sm text-gray-400 flex items-center justify-center gap-1.5 mt-4">
              <AlertCircle className="w-4 h-4" /> 허위 사실이나 비방 목적의 리뷰는 제재될 수 있습니다.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
