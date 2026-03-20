import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { CourseCard } from '../components/CourseCard';
import { CourseCardSkeleton } from '../components/course/CourseSkeleton';
import { courseService, reviewService, userService } from '../api/api';
import { Course, User } from '../types/types';

interface CourseWithReview extends Course {
  latestReviewContent?: string;
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">{title}</h2>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentCourses, setRecentCourses] = useState<CourseWithReview[]>([]);
  const [honeyGECourses, setHoneyGECourses] = useState<Course[]>([]);
  const [majorCourses, setMajorCourses] = useState<Course[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allCourses, userData] = await Promise.all([
          courseService.getAllCourses(),
          userService.getCurrentUser(),
        ]);
        setUser(userData);

        const recent = allCourses.slice(0, 3);
        const coursesWithReviews = await Promise.all(
          recent.map(async (course) => {
            const reviews = await reviewService.getReviewsByCourseId(course.id);
            const latestReview = reviews.length > 0 ? reviews[0].content : undefined;
            return { ...course, latestReviewContent: latestReview };
          }),
        );
        setRecentCourses(coursesWithReviews);

        setHoneyGECourses(await courseService.getHoneyGE());
        setMajorCourses(await courseService.getMajorRecommended(userData?.department || '컴퓨터공학과'));
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="page-shell pt-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-[rgba(15,23,42,0.08)] bg-white px-6 py-10 md:px-8">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="mascot-badge animate-mascot-a left-[-1.5rem] top-[18%] hidden lg:flex opacity-80">
              <div className="mascot-core">안</div>
              <div>
                <p className="text-sm font-black text-slate-900">안뇽이</p>
                <p className="text-xs text-slate-500">캠퍼스를 뛰어다니는 중</p>
              </div>
            </div>
            <div className="mascot-badge animate-mascot-b right-[-1.5rem] top-[16%] hidden lg:flex opacity-80">
              <div className="mascot-core">인</div>
              <div>
                <p className="text-sm font-black text-slate-900">인덕이</p>
                <p className="text-xs text-slate-500">강의평 탐색 도와주는 중</p>
              </div>
            </div>
            <div className="mascot-badge animate-mascot-c bottom-[10%] right-[4%] hidden xl:flex opacity-75">
              <div className="mascot-core">안</div>
              <div>
                <p className="text-sm font-black text-slate-900">안뇽이</p>
                <p className="text-xs text-slate-500">이번 학기 강의 체크</p>
              </div>
            </div>
            <div className="absolute left-[-4rem] top-[10%] h-48 w-48 rounded-full bg-[#edf4ff] blur-3xl" />
            <div className="absolute right-[-4rem] top-[18%] h-56 w-56 rounded-full bg-[#f2f7fc] blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-5xl">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#005bac]">인하대학교 강의평</p>
            <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-tight text-slate-950 md:text-[3.15rem] md:leading-[1.02]">
              강의를 검색하고
              <br />
              바로 비교하세요.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 md:text-base">
              강의명이나 교수님 이름으로 빠르게 찾아볼 수 있습니다.
            </p>

            <form onSubmit={handleSearch} className="mt-8 max-w-4xl">
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="강의명, 교수님, 학과로 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-16 rounded-full pl-12 pr-5 text-base md:text-lg"
                  />
                </div>
                <Button type="submit" size="lg" className="h-16 rounded-full px-8 text-base">
                  검색
                </Button>
              </div>
            </form>
          </div>
        </section>
      </div>

      <div className="page-shell mt-10 space-y-12">
        <section>
          <SectionHeader title="최근 등록된 강의평가" description="최근에 리뷰가 쌓인 강의입니다." />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {isLoading
              ? [1, 2, 3].map((i) => <CourseCardSkeleton key={i} />)
              : recentCourses.map((course) => (
                  <CourseCard key={course.id} course={course} showPreview previewText={course.latestReviewContent} />
                ))}
          </div>
        </section>

        <section>
          <SectionHeader title="교양 추천" description="부담과 만족도를 함께 보고 고를 수 있습니다." />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {isLoading
              ? [1, 2, 3].map((i) => <CourseCardSkeleton key={i} />)
              : honeyGECourses.map((course) => <CourseCard key={course.id} course={course} />)}
          </div>
        </section>

        <section>
          <SectionHeader
            title={`${user?.department || '컴퓨터공학과'} 추천 강의`}
            description="같은 학과 학생들이 많이 찾는 전공 강의입니다."
          />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {isLoading
              ? [1, 2, 3].map((i) => <CourseCardSkeleton key={i} />)
              : majorCourses.map((course) => <CourseCard key={course.id} course={course} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
