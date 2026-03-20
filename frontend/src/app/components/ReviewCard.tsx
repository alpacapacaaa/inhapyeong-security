import { useState } from 'react';
import { Star, ThumbsUp, AlertCircle, BookOpen, PenTool, ChevronDown, ChevronUp, Sparkles, FileText } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Review } from '../types/types';

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

export function ReviewCard({ review }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [likes, setLikes] = useState(review.likes);
  const [liked, setLiked] = useState(false);
  const stars = Array.from({ length: 5 }, (_, i) => i < review.rating);
  const reviewDate = new Date(review.createdAt).toLocaleDateString('ko-KR');

  // Check if review has any extended fields
  const hasExtendedInfo = !!(
    review.oneLineTip ||
    (review.examTypes && review.examTypes.length > 0) ||
    review.assignmentType ||
    review.textbook ||
    (review.recommendFor && review.recommendFor.length > 0) ||
    (review.notRecommendFor && review.notRecommendFor.length > 0)
  );

  // 알고리즘: 글자 수가 100자 이상이거나, 상세 선택항목(hasExtendedInfo)이 작성되었을 경우 우수 강의평으로 선정
  const hasExamInfo = !!(
    review.examInfo ||
    (review.examTypes && review.examTypes.length > 0) ||
    (review.examKeywords && review.examKeywords.length > 0)
  );

  const handleLikeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setLiked((previous) => {
      const nextLiked = !previous;
      setLikes((currentLikes) => currentLikes + (nextLiked ? 1 : -1));
      return nextLiked;
    });
  };

  return (
    <Card
      className={`rounded-[1.75rem] border border-[rgba(15,23,42,0.08)] bg-white transition-all duration-300 ${hasExtendedInfo ? 'cursor-pointer hover:border-[#005bac]/18 hover:shadow-[0_24px_50px_rgba(15,23,42,0.08)]' : ''}`}
      onClick={() => hasExtendedInfo && setIsExpanded(!isExpanded)}
    >
      <CardContent className="p-5 md:p-6">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[rgba(15,23,42,0.08)] bg-[#f7fafc] px-3 py-1 text-xs font-bold text-slate-700">
                  {review.isAnonymous ? '익명 리뷰' : '작성자 공개'}
                </span>
                <span className="text-sm font-semibold text-slate-500">{review.semester}</span>
                {hasExamInfo && (
                  <span className="rounded-full border border-[rgba(15,23,42,0.08)] bg-[#f7fafc] px-3 py-1 text-xs font-bold text-slate-700">
                    시험 정보 포함
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 lg:items-end">
              <div className="flex items-center">
                {stars.map((filled, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 md:h-5 md:w-5 ${filled ? 'fill-[#005bac] text-[#005bac]' : 'fill-slate-100 text-slate-200'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-slate-400">{reviewDate}</span>
            </div>
          </div>

          {!isExpanded && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-slate-600">난이도 <strong className="ml-1 text-slate-800">{difficultyLabel[review.difficulty]}</strong></Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-slate-600">학습량 <strong className="ml-1 text-slate-800">{workloadLabel[review.workload]}</strong></Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-slate-600">출석 <strong className="ml-1 text-slate-800">{attendanceLabel[review.attendance]}</strong></Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-slate-600">성적 <strong className="ml-1 text-slate-800">{gradingLabel[review.grading]}</strong></Badge>
            </div>
          )}

          <div className={`grid transition-all duration-300 ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="space-y-6 overflow-hidden">

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#f9fbfc] p-3 text-center">
                  <p className="mb-1 text-xs text-slate-500">난이도</p>
                  <p className="font-bold text-slate-900">{difficultyLabel[review.difficulty]}</p>
                </div>
                <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#f9fbfc] p-3 text-center">
                  <p className="mb-1 text-xs text-slate-500">학습량</p>
                  <p className="font-bold text-slate-900">{workloadLabel[review.workload]}</p>
                </div>
                <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#f9fbfc] p-3 text-center">
                  <p className="mb-1 text-xs text-slate-500">출석 체크</p>
                  <p className="font-bold text-slate-900">{attendanceLabel[review.attendance]}</p>
                </div>
                <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#f9fbfc] p-3 text-center">
                  <p className="mb-1 text-xs text-slate-500">성적 비율</p>
                  <p className="font-bold text-slate-900">{gradingLabel[review.grading]}</p>
                </div>
              </div>

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

                  {review.examInfo && (
                    <p className="text-sm leading-6 text-slate-700">{review.examInfo}</p>
                  )}

                  {review.examTypes && review.examTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {review.examTypes.map((type) => (
                        <span key={type} className="px-2.5 py-1 rounded-md bg-white border border-[rgba(15,23,42,0.08)] text-xs font-bold text-slate-700">
                          {type}
                        </span>
                      ))}
                    </div>
                  )}

                  {review.examKeywords && review.examKeywords.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-600">자주 언급된 키워드</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {review.examKeywords.map((keyword) => (
                          <span key={keyword} className="rounded-full border border-[rgba(15,23,42,0.08)] bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {review.oneLineTip && (
                <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#f9fbfc] p-4">
                  <div className="flex items-center gap-2 text-[#005bac]">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-bold">한줄 팁</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{review.oneLineTip}</p>
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

          <p className={`leading-relaxed text-slate-700 ${isExpanded ? 'pt-2 text-[15px]' : 'line-clamp-3 text-sm'}`}>
            {review.content}
          </p>

          <div className="flex items-center justify-between pt-1">
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
