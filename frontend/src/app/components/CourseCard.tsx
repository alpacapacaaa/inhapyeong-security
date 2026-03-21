import { Link } from 'react-router';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Course } from '../types/types';
import { StarRating } from './StarRating';

interface CourseCardProps {
  course: Course;
  showPreview?: boolean;
  previewText?: string;
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

// "핵심교양-2.역사, 사상, 문화" -> "핵심교양 2영역" 포맷 변환
const formatArea = (type: string) => {
  if (type.includes('핵심교양-')) {
    const num = type.split('-')[1].split('.')[0];
    return `핵심교양 ${num}영역`;
  }
  if (type.includes('일반교양-')) {
    const num = type.split('-')[1].split('.')[0];
    return `일반교양 ${num}영역`;
  }
  return type;
};

export function CourseCard({ course, showPreview = false, previewText }: CourseCardProps) {
  return (
    <Link to={`/course/${course.id}`} className="h-full block">
      <Card className="h-full cursor-pointer overflow-hidden rounded-[1.4rem] border border-[rgba(15,23,42,0.08)] bg-white transition-colors hover:border-[#005bac]/18 hover:shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
        <CardContent className="flex h-full flex-col p-5 md:p-6">
          <div className="space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#005bac]">
                  {course.category === '전공' ? '전공 강의' : '교양 강의'}
                </p>
                <h3 className="line-clamp-2 text-[1.02rem] font-black tracking-tight text-slate-900">{course.name}</h3>
                <p className="mt-1 text-[12px] font-medium text-slate-500">
                  {course.professor} 교수님 · {course.department}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-[rgba(15,23,42,0.08)] bg-[#f7f9fb] px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                {formatArea(course.type)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <StarRating
                value={course.rating}
                size="sm"
                valueClassName="text-[1.35rem]"
                reviewCount={course.reviewCount}
                reviewCountClassName="text-[12px]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
                난이도 {difficultyLabel[course.difficulty]}
              </Badge>
              <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
                학습량 {workloadLabel[course.workload]}
              </Badge>
            </div>

            {showPreview && previewText && (
              <p className="line-clamp-3 border-t border-dashed border-[rgba(15,23,42,0.08)] pt-4 text-sm leading-6 text-slate-600">
                {previewText}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
