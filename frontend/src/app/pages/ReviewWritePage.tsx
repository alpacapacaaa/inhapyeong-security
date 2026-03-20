import { useState, useEffect, useRef } from 'react';
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
import { semesters as semesterOptions } from '../data/mockData';
import { toast } from 'sonner';

const examTypeOptions = ['객관식', '단답형', '주관식/서술형', '오픈북', '과제 대체', '실습/발표', '조별 발표', '코드 짜기'];
const recommendOptions = ['벼락치기 가능', '성실한 출석러', '팀플/발표 선호'];
const notRecommendOptions = ['암기 취약', '팀플 극혐', '발표 공포증'];

export function ReviewWritePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const availableSemesters = semesterOptions.filter((semester) => semester !== '전체');

  // 기본 항목
  const [semester, setSemester] = useState(searchParams.get('semester') ?? availableSemesters[0] ?? '2025-2학기');
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
  const [assignmentType, setAssignmentType] = useState<string>('개인 과제 위주');
  const [textbook, setTextbook] = useState<string>('참고용');
  const [examInfo, setExamInfo] = useState('');
  const [recommendFor, setRecommendFor] = useState<string[]>([]);
  const [notRecommendFor, setNotRecommendFor] = useState<string[]>([]);
  const [tempRecommend, setTempRecommend] = useState('');
  const [tempNotRecommend, setTempNotRecommend] = useState('');
  const [examKeywords, setExamKeywords] = useState<string[]>([]);
  const [tempKeyword, setTempKeyword] = useState('');

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

  const addKeyword = () => {
    if (tempKeyword.trim() && !examKeywords.includes(tempKeyword.trim())) {
      setExamKeywords([...examKeywords, tempKeyword.trim()]);
      setTempKeyword('');
    }
  };

  const removeKeyword = (target: string) => {
    setExamKeywords(examKeywords.filter(k => k !== target));
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
        examInfo,
        examKeywords,
        recommendFor,
        notRecommendFor,
      });

      await userService.addPoints(30, '상세 강의평 작성');

      toast.success('강의평이 등록되었습니다! 30P를 받았습니다.');
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
    { label: '출석체크 엄격도', value: attScore, setter: setAttScore, options: ['자유로움', '가끔 확인', '보통', '자주 확인', '엄격함'] },
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
        <div className="page-panel rounded-[2rem] p-6 md:p-8">
          <div className="mb-8 rounded-[1.75rem] border border-[rgba(15,23,42,0.08)] bg-[#f8fbff] p-5 md:p-6">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#005bac]">강의평</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">강의평 남기기</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">실제로 수강한 내용을 기준으로 다음 학기 수강생에게 도움이 될 정보를 남겨주세요.</p>
          </div>

          <div className="mb-8 border-b border-gray-100 pb-6">
            <h2 className="text-xl font-bold text-gray-900">{course.name}</h2>
            <p className="text-gray-500 mt-1">
              {course.professor} 교수님 · {course.department}
            </p>
            <p className="mt-3 text-sm font-medium text-slate-500">
              수강한 학기 기준으로 남겨두면 강의 흐름을 더 정확하게 확인할 수 있습니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* 기본 정보 섹션 */}
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
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
                </div>

                <div className="space-y-3 flex-1">
                  <Label className="text-base font-semibold">전체 별점</Label>
                  <div className="flex items-center gap-1" onMouseLeave={() => setHoveredRating(0)}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <div key={value} className="relative cursor-pointer flex">
                        <Star
                          className={`w-9 h-9 transition-colors ${value <= Math.floor(displayRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-200'
                            }`}
                        />
                        {/* Half star overlay */}
                        {displayRating === value - 0.5 && (
                          <div className="absolute top-0 left-0 overflow-hidden w-[50%]">
                            <Star className="w-9 h-9 fill-yellow-400 text-yellow-400" />
                          </div>
                        )}
                        <div
                          className="absolute top-0 left-0 w-1/2 h-full z-10"
                          onClick={() => setRating(value - 0.5)}
                          onMouseEnter={() => setHoveredRating(value - 0.5)}
                        />
                        <div
                          className="absolute top-0 right-0 w-1/2 h-full z-10"
                          onClick={() => setRating(value)}
                          onMouseEnter={() => setHoveredRating(value)}
                        />
                      </div>
                    ))}
                    {rating > 0 && <span className="ml-3 font-bold text-lg text-gray-700">{rating}점</span>}
                  </div>
                </div>
              </div>

              {/* 🌟 육각형 지표 평가 (1~5점) */}
              <div className="pt-4 space-y-4">
                <Label className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#005bac]" />
                  상세 지표
                </Label>
                <div className="rounded-[1.75rem] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,#fbfdff_0%,#f4f8fb_100%)] p-4 md:p-5">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-500">클릭하거나 드래그한 뒤 놓으면 가장 가까운 단계로 맞춰집니다.</p>
                    <span className="rounded-full border border-[rgba(15,23,42,0.08)] bg-white px-3 py-1 text-xs font-black text-slate-500 shadow-sm">5단계 선택</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {currentMetrics.map((metric) => {
                      const selectedLabel = getMetricOption(metric.value, metric.options);
                      const currentRatio =
                        dragPreview?.label === metric.label ? dragPreview.ratio : (metric.value - 1) / 4;
                      const isDraggingCurrentMetric = draggingMetric === metric.label;

                      return (
                        <div key={metric.label} className="rounded-[1.2rem] border border-[rgba(15,23,42,0.08)] bg-white p-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <Label className="text-sm font-black text-slate-900">{metric.label}</Label>
                              <p className="mt-1 text-[11px] font-medium text-slate-500">{metric.options[0]} - {metric.options[4]}</p>
                            </div>
                            <span className="rounded-full bg-[#edf4ff] px-2.5 py-1 text-xs font-black text-[#005bac]">
                              {selectedLabel}
                            </span>
                          </div>

                          <div className="mt-4 rounded-[1rem] border border-[rgba(15,23,42,0.06)] bg-white/80 px-3 py-3">
                            <div className="mb-2 flex items-center justify-between text-[10px] font-black text-slate-400">
                              <span>{metric.options[0]}</span>
                              <span>{metric.options[4]}</span>
                            </div>

                            <div
                              className="relative flex items-center gap-1 rounded-full bg-slate-100/90 p-1 touch-none select-none"
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
                                className={`pointer-events-none absolute bottom-1 top-1 rounded-full bg-[#005bac] shadow-[0_12px_24px_rgba(0,91,172,0.16)] ${
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
            <div className="space-y-3 pt-6 border-t border-slate-100">
              <Label className="text-base font-semibold text-gray-800">시험 방식 (다중 선택 가능)</Label>
              <div className="flex flex-wrap gap-2">
                {examTypeOptions.map((item) => {
                  const isChecked = examTypes.includes(item);
                    return (
                    <label key={item} className={`flex items-center rounded-full border px-4 py-2 cursor-pointer transition-all ${isChecked ? 'border-[#005bac] bg-[#edf4ff] text-[#005bac]' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
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
            </div>

            {/* 과제 유형 */}
            <div className="space-y-3 pt-4">
              <Label className="text-base font-semibold text-gray-800">과제 및 팀플 비중</Label>
              <RadioGroup value={assignmentType} onValueChange={setAssignmentType} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['개인 과제 위주', '팀플 위주', '초반에만 있음', '과제 없음'].map((item) => (
                  <div key={item}>
                    <RadioGroupItem value={item} id={`assign-${item}`} className="peer sr-only" />
                    <Label htmlFor={`assign-${item}`} className="flex justify-center rounded-lg border p-2.5 text-sm cursor-pointer peer-data-[state=checked]:border-[#005bac] peer-data-[state=checked]:bg-[#edf4ff] peer-data-[state=checked]:text-[#005bac] hover:bg-gray-50">
                      {item}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* 교재 사용 */}
            <div className="space-y-3 pt-4">
              <Label className="text-base font-semibold text-gray-800">교재 사용도</Label>
              <RadioGroup value={textbook} onValueChange={setTextbook} className="grid grid-cols-2 gap-3">
                {['무조건 사야함 (필수)', '참고용', '교수님 PPT 위주', '거의 안 씀'].map((item) => (
                  <div key={item}>
                    <RadioGroupItem value={item} id={`book-${item}`} className="peer sr-only" />
                    <Label htmlFor={`book-${item}`} className="flex justify-center rounded-lg border p-2.5 text-sm cursor-pointer peer-data-[state=checked]:border-[#005bac] peer-data-[state=checked]:bg-[#edf4ff] peer-data-[state=checked]:text-[#005bac] hover:bg-gray-50">
                      {item}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* 추천 대상 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="flex h-full flex-col rounded-2xl border border-[#c9efd9] bg-[linear-gradient(180deg,#f4fcf7_0%,#edf9f1_100%)] p-5 shadow-[0_14px_30px_rgba(23,114,69,0.06)]">
                <div className="flex-1 space-y-4">
                  <Label className="text-sm font-black text-[#177245] flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    추천해요
                  </Label>
                  <p className="text-xs font-medium text-slate-500">잘 맞는 수강생 유형을 골라두면 훨씬 읽기 쉬워집니다.</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                      {recommendOptions.map((item) => (
                        <label key={item} className={`flex items-center gap-2 cursor-pointer rounded-lg border px-3 py-1.5 text-[13px] font-bold transition-all ${recommendFor.includes(item) ? 'border-[#177245] bg-[#177245] text-white shadow-sm' : 'border-[#c9efd9] bg-white text-[#177245] hover:bg-[#eefaf2]'}`}>
                          <Checkbox className="sr-only" checked={recommendFor.includes(item)} onCheckedChange={() => toggleSelection(item, recommendFor, setRecommendFor)} />
                          {item}
                        </label>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                      {recommendFor.filter(item => !recommendOptions.includes(item)).map(item => (
                        <span key={item} className="flex items-center gap-1 rounded-md border border-[#c9efd9] bg-white px-2.5 py-1 text-[11px] font-bold text-[#177245] shadow-sm">
                          {item}
                          <button type="button" onClick={() => toggleSelection(item, recommendFor, setRecommendFor)}><X className="w-2.5 h-2.5" /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4">
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
                      className="rounded-xl border-[#c9efd9] bg-white text-sm focus:border-[#177245] focus:ring-[#177245]"
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

              <div className="flex h-full flex-col space-y-4 rounded-2xl border border-[#f3d4d4] bg-[linear-gradient(180deg,#fff8f8_0%,#fff2f2_100%)] p-5 shadow-[0_14px_30px_rgba(196,59,59,0.06)]">
                <div className="flex-1 space-y-4">
                  <Label className="text-sm font-black text-[#c43b3b] flex items-center gap-1.5">
                    <X className="w-3.5 h-3.5" />
                    비추천 대상
                  </Label>
                  <p className="text-xs font-medium text-slate-500">피하는 게 좋은 유형도 같이 적어두면 맥락이 더 잘 보입니다.</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                      {notRecommendOptions.map((item) => (
                        <label key={item} className={`flex items-center gap-2 cursor-pointer rounded-lg border px-3 py-1.5 text-[13px] font-bold transition-all ${notRecommendFor.includes(item) ? 'border-[#c43b3b] bg-[#c43b3b] text-white shadow-sm' : 'border-[#f3d4d4] bg-white text-[#c43b3b] hover:bg-[#fff3f3]'}`}>
                          <Checkbox className="sr-only" checked={notRecommendFor.includes(item)} onCheckedChange={() => toggleSelection(item, notRecommendFor, setNotRecommendFor)} />
                          {item}
                        </label>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                      {notRecommendFor.filter(item => !notRecommendOptions.includes(item)).map(item => (
                        <span key={item} className="flex items-center gap-1 rounded-md border border-[#f3d4d4] bg-white px-2.5 py-1 text-[11px] font-bold text-[#c43b3b] shadow-sm">
                          {item}
                          <button type="button" onClick={() => toggleSelection(item, notRecommendFor, setNotRecommendFor)}><X className="w-2.5 h-2.5" /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-2">
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
                      className="rounded-xl border-[#f3d4d4] bg-white text-sm focus:border-[#c43b3b] focus:ring-[#c43b3b]"
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
            <Accordion type="single" collapsible className="mt-4 w-full overflow-hidden rounded-xl border shadow-sm">
              <AccordionItem value="exam-info" className="border-b-0">
                <AccordionTrigger className="border-b border-[rgba(15,23,42,0.08)] bg-[#f8fafc] px-5 py-4 font-bold text-slate-800 transition-colors hover:bg-slate-100">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-[#005bac]" />
                    시험 출제 방식, 족보, 자주 나온 키워드
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 py-6 bg-white">
                  <Textarea
                    value={examInfo}
                    onChange={(e) => setExamInfo(e.target.value)}
                    placeholder="시험 문제 스타일이나 자주 나온 범위, 족보 체감 정도를 적어주세요."
                    className="mb-6 min-h-[120px] resize-none rounded-xl border-gray-200 p-4 text-sm leading-relaxed"
                  />

                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-[#005bac]" />
                      자주 나온 키워드
                    </Label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {examKeywords.map((k) => (
                        <span key={k} className="animate-in zoom-in-95 duration-200 flex items-center gap-1.5 rounded-lg border border-[#cfe0f1] bg-[#edf4ff] px-3 py-1.5 text-xs font-bold text-[#005bac]">
                          {k}
                          <button type="button" onClick={() => removeKeyword(k)} className="hover:text-amber-900 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {examKeywords.length === 0 && (
                        <p className="text-xs text-slate-400 italic">아직 추가된 키워드가 없습니다.</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={tempKeyword}
                        onChange={(e) => setTempKeyword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addKeyword();
                          }
                        }}
                        placeholder="예: 프레임워크, UML, 객체지향..."
                        className="rounded-xl bg-gray-50 border-gray-100"
                      />
                      <Button
                        type="button"
                        onClick={addKeyword}
                        variant="outline"
                        className="aspect-square w-10 shrink-0 rounded-xl p-0"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">엔터를 치거나 + 버튼을 눌러 키워드를 추가할 수 있습니다.</p>
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
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
              <Button type="button" variant="outline" size="lg" onClick={() => navigate(-1)} disabled={isSubmitting} className="sm:w-32 rounded-xl">
                취소
              </Button>
              <Button type="submit" size="lg" disabled={isSubmitting} className="flex-1 rounded-xl font-bold">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    제출 중...
                  </>
                ) : (
                  '강의평 등록하기'
                )}
              </Button>
            </div>

            <p className="text-center text-sm font-medium text-slate-500">등록이 완료되면 30P가 지급됩니다.</p>
            <p className="text-center text-sm text-gray-400 flex items-center justify-center gap-1.5 mt-4">
              <AlertCircle className="w-4 h-4" /> 허위 사실이나 비방 목적의 리뷰는 제재될 수 있습니다.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
