import { useState } from 'react';
import { ThumbsUp, AlertCircle, AlertTriangle, BookOpen, Flame, PenTool, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Review } from '../types/types';
import { StarRating } from './StarRating';

interface ReviewCardProps {
  review: Review;
}

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

const attendanceLabel = {
  strict: '엄격',
  medium: '보통',
  flexible: '자유',
};

const gradingLabel = {
  generous: '잘줌',
  medium: '보통',
  strict: '짜게줌',
};

const metricLevel = {
  easy: 1,
  medium: 2,
  hard: 3,
  light: 1,
  heavy: 3,
  strict: 1,
  flexible: 3,
  generous: 3,
};

const getMetricTone = (level: number) => {
  if (level <= 1) {
    return {
      card: 'border-[rgba(129,140,161,0.16)] bg-[#f7f9fc]',
      text: 'text-slate-800',
      bar: 'bg-[#8799b4]',
    };
  }

  if (level === 2) {
    return {
      card: 'border-[rgba(0,91,172,0.12)] bg-[#f3f8ff]',
      text: 'text-[#2f4a72]',
      bar: 'bg-[#718caf]',
    };
  }

  return {
      card: 'border-[rgba(0,91,172,0.16)] bg-[#ecf5ff]',
      text: 'text-[#204b7a]',
      bar: 'bg-[#587cac]',
  };
};

const getBadgeTone = (badge: string) => {
  if (badge.includes('정성') || badge.includes('우수')) {
    return 'border-[#f1d9b5] bg-[#fff6e9] text-[#b56b19]';
  }

  if (badge.includes('시험')) {
    return 'border-[rgba(0,91,172,0.12)] bg-[#f3f8ff] text-[#4f6f9e]';
  }

  if (badge.includes('추천')) {
    return 'border-[#d7ecd9] bg-[#f4fbf4] text-[#3f7f56]';
  }

  if (badge.includes('과제')) {
    return 'border-[#efe1bf] bg-[#fff9ea] text-[#9b7517]';
  }

  if (badge.includes('주의')) {
    return 'border-[#f0d4da] bg-[#fff5f7] text-[#b85b72]';
  }

  return 'border-[rgba(15,23,42,0.08)] bg-[#f8fafc] text-slate-600';
};

const getBadgeIcon = (badge: string) => {
  if (badge.includes('정성') || badge.includes('우수')) {
    return BookOpen;
  }

  if (badge.includes('시험')) {
    return FileText;
  }

  if (badge.includes('추천')) {
    return Flame;
  }

  if (badge.includes('과제')) {
    return PenTool;
  }

  if (badge.includes('주의')) {
    return AlertTriangle;
  }

  return null;
};

export function ReviewCard({ review }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [likes, setLikes] = useState(review.likes);
  const [liked, setLiked] = useState(false);

  // Check if review has any extended fields
  const hasExtendedInfo = !!(
    (review.examTypes && review.examTypes.length > 0) ||
    review.pastExamHelpfulness ||
    review.scopePredictability ||
    (review.studyResources && review.studyResources.length > 0) ||
    (review.problemStyles && review.problemStyles.length > 0) ||
    review.examPrepTip ||
    review.assignmentType ||
    review.textbook ||
    (review.recommendFor && review.recommendFor.length > 0) ||
    (review.notRecommendFor && review.notRecommendFor.length > 0)
  );

  const hasExamInfo = !!(
    review.pastExamHelpfulness ||
    review.scopePredictability ||
    (review.studyResources && review.studyResources.length > 0) ||
    (review.problemStyles && review.problemStyles.length > 0) ||
    review.examPrepTip ||
    (review.examTypes && review.examTypes.length > 0)
  );

  const handleLikeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setLiked((previous) => {
      const nextLiked = !previous;
      setLikes((currentLikes) => currentLikes + (nextLiked ? 1 : -1));
      return nextLiked;
    });
  };

  const difficultyTone = getMetricTone(metricLevel[review.difficulty] ?? 2);
  const workloadTone = getMetricTone(metricLevel[review.workload] ?? 2);
  const attendanceTone = getMetricTone(metricLevel[review.attendance] ?? 2);
  const gradingTone = getMetricTone(metricLevel[review.grading] ?? 2);

  return (
    <Card
      className={`overflow-hidden rounded-[1.45rem] border border-[rgba(15,23,42,0.08)] bg-white transition-colors duration-300 ${hasExtendedInfo ? 'cursor-pointer hover:border-[#005bac]/18 hover:shadow-[0_14px_30px_rgba(15,23,42,0.05)]' : ''}`}
      onClick={() => hasExtendedInfo && setIsExpanded(!isExpanded)}
    >
      <CardContent className="p-5 md:p-6">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-slate-600">{review.semester}</span>
                {review.badges?.map((badge) => {
                  const BadgeIcon = getBadgeIcon(badge);

                  return (
                    <span key={badge} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getBadgeTone(badge)}`}>
                      {BadgeIcon && <BadgeIcon className="h-3.5 w-3.5" />}
                      {badge}
                    </span>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <div className={`rounded-[0.9rem] border px-3 py-2 ${difficultyTone.card}`}>
                  <p className="text-[11px] font-semibold text-slate-400">난이도</p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className={`text-sm font-bold ${difficultyTone.text}`}>{difficultyLabel[review.difficulty]}</p>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((level) => (
                        <span
                          key={level}
                          className={`h-1.5 w-4 rounded-full ${level <= (metricLevel[review.difficulty] ?? 2) ? difficultyTone.bar : 'bg-slate-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className={`rounded-[0.9rem] border px-3 py-2 ${workloadTone.card}`}>
                  <p className="text-[11px] font-semibold text-slate-400">학습량</p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className={`text-sm font-bold ${workloadTone.text}`}>{workloadLabel[review.workload]}</p>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((level) => (
                        <span
                          key={level}
                          className={`h-1.5 w-4 rounded-full ${level <= (metricLevel[review.workload] ?? 2) ? workloadTone.bar : 'bg-slate-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className={`rounded-[0.9rem] border px-3 py-2 ${attendanceTone.card}`}>
                  <p className="text-[11px] font-semibold text-slate-400">출석</p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className={`text-sm font-bold ${attendanceTone.text}`}>{attendanceLabel[review.attendance]}</p>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((level) => (
                        <span
                          key={level}
                          className={`h-1.5 w-4 rounded-full ${level <= (metricLevel[review.attendance] ?? 2) ? attendanceTone.bar : 'bg-slate-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className={`rounded-[0.9rem] border px-3 py-2 ${gradingTone.card}`}>
                  <p className="text-[11px] font-semibold text-slate-400">성적</p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className={`text-sm font-bold ${gradingTone.text}`}>{gradingLabel[review.grading]}</p>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((level) => (
                        <span
                          key={level}
                          className={`h-1.5 w-4 rounded-full ${level <= (metricLevel[review.grading] ?? 2) ? gradingTone.bar : 'bg-slate-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 lg:items-end">
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">평점</span>
              <StarRating
                value={review.rating}
                size="md"
                showValue={false}
                starClassName="h-5 w-5 md:h-6 md:w-6"
                filledStarClassName="fill-[#f2ba2f] text-[#f2ba2f] drop-shadow-[0_3px_8px_rgba(242,186,47,0.18)]"
                emptyStarClassName="text-slate-200"
              />
            </div>
          </div>

          <div className={`grid transition-all duration-300 ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="space-y-6 overflow-hidden">

              {(review.examTypes || review.assignmentType || review.textbook) && (
                <div className="space-y-3 rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#f9fbfc] p-4">
                  {review.examTypes && review.examTypes.length > 0 && (
                    <div className="flex gap-2 text-sm">
                      <span className="flex w-24 shrink-0 items-center gap-1.5 font-semibold text-[#005bac]"><PenTool className="w-4 h-4 text-[#005bac]" /> 시험 방식</span>
                      <div className="flex flex-wrap gap-1.5">
                        {review.examTypes.map(type => (
                          <span key={type} className="rounded-md border border-[rgba(15,23,42,0.08)] bg-white px-2 py-0.5 text-xs text-[#005bac]">{type}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {review.assignmentType && (
                    <div className="flex gap-2 text-sm text-slate-700">
                      <span className="flex w-24 shrink-0 items-center gap-1.5 font-semibold text-[#005bac]"><AlertCircle className="w-4 h-4 text-[#005bac]" /> 과제/팀플</span>
                      <span>{review.assignmentType}</span>
                    </div>
                  )}
                  {review.textbook && (
                    <div className="flex gap-2 text-sm text-slate-700">
                      <span className="flex w-24 shrink-0 items-center gap-1.5 font-semibold text-[#005bac]"><BookOpen className="w-4 h-4 text-[#005bac]" /> 교재 사용</span>
                      <span>{review.textbook}</span>
                    </div>
                  )}
                </div>
              )}

              {hasExamInfo && (
                <div className="space-y-3 rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#f9fbfc] p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <h4 className="text-sm font-bold text-slate-900">시험/족보 정보</h4>
                  </div>

                  {review.examTypes && review.examTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {review.examTypes.map((type) => (
                        <span key={type} className="px-2.5 py-1 rounded-md bg-white border border-[rgba(15,23,42,0.08)] text-xs font-bold text-slate-700">
                          {type}
                        </span>
                      ))}
                    </div>
                  )}

                  {(review.pastExamHelpfulness || review.scopePredictability) && (
                    <div className="grid gap-4 md:grid-cols-2">
                      {review.pastExamHelpfulness && (
                        <div className="px-1 py-1">
                          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">족보 도움도</p>
                          <p className="mt-1.5 text-sm font-semibold text-slate-800">{review.pastExamHelpfulness}</p>
                        </div>
                      )}
                      {review.scopePredictability && (
                        <div className="border-t border-slate-100 px-1 py-1 md:border-l md:border-t-0 md:pl-4">
                          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">범위 예측</p>
                          <p className="mt-1.5 text-sm font-semibold text-slate-800">{review.scopePredictability}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {((review.studyResources && review.studyResources.length > 0) || (review.problemStyles && review.problemStyles.length > 0)) && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">주요 공부 자료</p>
                      <div className="flex flex-wrap gap-2">
                        {(review.studyResources ?? review.problemStyles ?? []).map((resource) => (
                          <span key={resource} className="rounded-full border border-[rgba(15,23,42,0.08)] bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {resource}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {review.examPrepTip && (
                    <div className="rounded-lg border border-[rgba(15,23,42,0.06)] bg-white px-3 py-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">시험 대비 팁</p>
                      <p className="mt-1.5 text-sm leading-6 text-slate-700">{review.examPrepTip}</p>
                    </div>
                  )}
                </div>
              )}

              {(review.recommendFor || review.notRecommendFor) && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {review.recommendFor && review.recommendFor.length > 0 && (
                    <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                      <h4 className="mb-2 text-sm font-bold text-green-800">이런 분들께 추천</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                        {review.recommendFor.map(item => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                  {review.notRecommendFor && review.notRecommendFor.length > 0 && (
                    <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                      <h4 className="mb-2 text-sm font-bold text-red-800">이런 분들은 피하세요</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                        {review.notRecommendFor.map(item => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[1rem] border border-[rgba(15,23,42,0.06)] bg-[#fbfcfe] px-4 py-4">
            <p className={`leading-relaxed text-slate-800 ${isExpanded ? 'text-[15px]' : 'line-clamp-3 text-sm'}`}>
              {review.content}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-[rgba(15,23,42,0.06)] pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleLikeClick}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors ${
                  liked
                    ? 'bg-[#edf4ff] text-[#005bac] hover:bg-[#e4eefc]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm font-medium">추천 {likes}</span>
              </button>
            </div>

            {hasExtendedInfo && (
              <button
                className="flex items-center gap-1 text-xs font-semibold text-[#005bac] hover:text-[#0162b4]"
              >
                {isExpanded ? (
                  <>접기 <ChevronUp className="w-3 h-3" /></>
                ) : (
                  <>자세히 보기 <ChevronDown className="w-3 h-3" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
