import { Star } from 'lucide-react';
import { cn } from './ui/utils';

type StarRatingProps = {
  value: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showValue?: boolean;
  className?: string;
  valueClassName?: string;
  starClassName?: string;
  filledStarClassName?: string;
  emptyStarClassName?: string;
  reviewCount?: number;
  reviewCountClassName?: string;
};

const sizeStyles = {
  sm: {
    wrap: 'gap-2',
    value: 'text-lg',
    stars: 'h-4 w-4',
    count: 'text-xs',
  },
  md: {
    wrap: 'gap-2.5',
    value: 'text-[1.65rem]',
    stars: 'h-5 w-5',
    count: 'text-sm',
  },
  lg: {
    wrap: 'gap-3.5',
    value: 'text-[2.3rem]',
    stars: 'h-7 w-7',
    count: 'text-[15px]',
  },
  xl: {
    wrap: 'gap-4',
    value: 'text-[2.6rem]',
    stars: 'h-8 w-8',
    count: 'text-[15px]',
  },
};

export function StarRating({
  value,
  size = 'md',
  showValue = true,
  className,
  valueClassName,
  starClassName,
  filledStarClassName,
  emptyStarClassName,
  reviewCount,
  reviewCountClassName,
}: StarRatingProps) {
  const styles = sizeStyles[size];

  return (
    <div className={cn('flex items-center', styles.wrap, className)}>
      {showValue && (
        <span className={cn('font-black tracking-tight text-slate-950', styles.value, valueClassName)}>
          {value.toFixed(1)}
        </span>
      )}

      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, index) => {
          const fillRatio = Math.max(0, Math.min(1, value - index));

          return (
            <span key={index} className="relative">
              <Star
                className={cn(
                  styles.stars,
                  'fill-slate-100 text-slate-200/90',
                  emptyStarClassName,
                  starClassName,
                )}
              />
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${fillRatio * 100}%` }}
              >
                <Star
                  className={cn(
                    styles.stars,
                    'fill-[#1c6cb3] text-[#1c6cb3]',
                    filledStarClassName,
                    starClassName,
                  )}
                />
              </span>
            </span>
          );
        })}
      </div>

      {typeof reviewCount === 'number' && (
        <span
          className={cn(
            'font-medium text-slate-400',
            styles.count,
            reviewCountClassName,
          )}
        >
          리뷰 {reviewCount}개
        </span>
      )}
    </div>
  );
}
