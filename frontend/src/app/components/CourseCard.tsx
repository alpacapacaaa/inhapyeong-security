import { Link } from 'react-router';
import { Star } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Course } from '../types/types';

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
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(course.rating));

  return (
    <Link to={`/course/${course.id}`} className="h-full block">
      <Card className="h-full cursor-pointer rounded-[1.75rem] border border-[#005bac]/10 bg-white shadow-[0_10px_28px_rgba(0,91,172,0.06)] transition-all hover:-translate-y-1 hover:border-[#1084e8]/30 hover:shadow-[0_20px_42px_rgba(16,132,232,0.12)]">
        <CardContent className="flex h-full flex-col p-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#1084e8]">
                  {course.category === '전공' ? 'Major Course' : 'General Education'}
                </p>
                <h3 className="text-xl font-black tracking-tight text-slate-900">{course.name}</h3>
                <p className="mt-1 text-[13px] font-medium text-slate-500">
                  {course.professor} 교수님 · {course.department}
                </p>
              </div>
              <span className="rounded-full border border-[#005bac]/10 bg-[#f4fbff] px-3 py-1 text-[11px] font-bold text-[#005bac]">
                {formatArea(course.type)}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-[#1084e8]/12 bg-gradient-to-r from-[#f6fbff] to-[#eef8ff] px-4 py-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Review Score</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-2xl font-black tracking-tight text-slate-900">{course.rating.toFixed(1)}</span>
                  <span className="text-sm font-medium text-slate-400">/ 5.0</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end">
                {stars.map((filled, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${filled ? 'fill-[#1084e8] text-[#1084e8]' : 'text-[#c8d7e6]'
                      }`}
                  />
                ))}
                </div>
                <span className="mt-1 block text-sm font-medium text-slate-500">리뷰 {course.reviewCount}개</span>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="rounded-full border border-[#005bac]/10 bg-[#f8fcff] px-3 py-1 text-slate-600">
                난이도 {difficultyLabel[course.difficulty]}
              </Badge>
              <Badge variant="secondary" className="rounded-full border border-[#005bac]/10 bg-[#f8fcff] px-3 py-1 text-slate-600">
                학습량 {workloadLabel[course.workload]}
              </Badge>
            </div>

            {showPreview && previewText && (
              <p className="line-clamp-3 border-t border-dashed border-[#005bac]/10 pt-4 text-sm leading-6 text-slate-600">
                {previewText}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
