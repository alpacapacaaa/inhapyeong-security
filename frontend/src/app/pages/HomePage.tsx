import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, ArrowRight } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { CourseCard } from '../components/CourseCard';
import { CourseCardSkeleton } from '../components/course/CourseSkeleton';
import { courseService, reviewService, userService } from '../api/api';
import { Course, User } from '../types/types';

interface CourseWithReview extends Course {
  latestReviewContent?: string;
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
          userService.getCurrentUser()
        ]);
        setUser(userData);

        // 1. Recent Courses with previews
        const recent = allCourses.slice(0, 3);
        const coursesWithReviews = await Promise.all(
          recent.map(async (course) => {
            const reviews = await reviewService.getReviewsByCourseId(course.id);
            const latestReview = reviews.length > 0 ? reviews[0].content : undefined;
            return { ...course, latestReviewContent: latestReview };
          })
        );
        setRecentCourses(coursesWithReviews);

        // 2. Honey GE Courses
        const honeyGE = await courseService.getHoneyGE();
        setHoneyGECourses(honeyGE);

        // 3. Department Courses (using user's dept or fallback)
        const myDept = userData?.department || '컴퓨터공학과';
        const departmentRecs = await courseService.getMajorRecommended(myDept);
        setMajorCourses(departmentRecs);

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
    <div className="min-h-screen bg-transparent pb-24">
      <div className="container mx-auto px-4 pt-10">
        <section className="overflow-hidden rounded-[2.5rem] border border-[#005bac]/10 bg-white shadow-[0_20px_60px_rgba(0,91,172,0.08)]">
          <div className="grid gap-8 px-6 py-10 md:px-10 md:py-14 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div>
              <p className="mb-4 text-[12px] font-black uppercase tracking-[0.24em] text-[#1084e8]">Inha University Lecture Review Archive</p>
              <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-900 md:text-5xl">
                인하대학교 강의평을
                <br />
                더 직관적이고 선명하게
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                강의명과 교수님 기준으로 강의를 모으고, 학기별 후기와 시험 정보를 한 자리에서 비교할 수 있게 정리했습니다.
                필요한 정보만 빠르게 읽히는, 인하대학교스러운 블루 톤의 강의평 플랫폼을 목표로 합니다.
              </p>

              <form onSubmit={handleSearch} className="mt-8 max-w-2xl">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="강의명, 교수님 성함으로 검색"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-14 rounded-full border-[#005bac]/10 bg-[#f8fcff] pl-12 text-base shadow-none focus:border-[#1084e8] focus:ring-[#1084e8]/20"
                    />
                  </div>
                  <Button type="submit" size="lg" className="h-14 rounded-full bg-gradient-to-r from-[#005bac] to-[#1084e8] px-8 text-white shadow-[0_12px_28px_rgba(16,132,232,0.24)] hover:from-[#0162b4] hover:to-[#04a1e2]">
                    검색하기
                  </Button>
                </div>
              </form>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-full border border-[#005bac]/10 bg-[#f8fcff] px-4 py-2 text-sm font-semibold text-[#005bac]">
                  최근 후기 기반 강의 탐색
                </div>
                <div className="rounded-full border border-[#1084e8]/12 bg-[#f1f9ff] px-4 py-2 text-sm font-semibold text-[#0162b4]">
                  학기별 리뷰 필터 지원
                </div>
                <div className="rounded-full border border-[#04a1e2]/14 bg-[#ecfbff] px-4 py-2 text-sm font-semibold text-[#047fb2]">
                  시험/족보 정보 분리 열람
                </div>
              </div>
            </div>

            <div className="grid gap-4 self-stretch">
              <div className="rounded-[2rem] bg-gradient-to-br from-[#005bac] via-[#0162b4] to-[#1084e8] p-6 text-white shadow-[0_16px_36px_rgba(0,91,172,0.22)]">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#c9f9ff]">What Matters</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-white/88">
                  <li>강의는 과목·교수님 기준으로 묶고 리뷰에는 수강 학기를 남깁니다.</li>
                  <li>리뷰 카드는 읽기 쉬운 정보 순서로 정리하고, 품질 뱃지는 실제 작성량 기준으로 붙습니다.</li>
                  <li>강의 상세에서는 전체 리뷰와 특정 학기 리뷰를 한 번에 비교할 수 있습니다.</li>
                </ul>
              </div>

              <div className="rounded-[2rem] border border-[#1084e8]/12 bg-[#edf7ff] p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0162b4]">Quick Access</p>
                <button
                  type="button"
                  onClick={() => navigate('/search')}
                  className="mt-4 flex w-full items-center justify-between rounded-2xl bg-white px-4 py-4 text-left shadow-sm transition hover:translate-y-[-1px]"
                >
                  <div>
                    <p className="text-base font-black text-slate-900">전체 강의 보러가기</p>
                    <p className="mt-1 text-sm text-slate-500">교양, 전공, 교수명 기준으로 바로 탐색</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#1084e8]" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="container mx-auto mt-16 space-y-14 px-4">
        {/* Recent Reviews Section */}
        <section className="rounded-[2rem] border border-[#005bac]/10 bg-white px-6 py-8 shadow-[0_12px_32px_rgba(0,91,172,0.05)] md:px-8">
          <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1084e8]">Latest Archive</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">최근 등록된 강의평가</h2>
            </div>
            <p className="text-sm font-medium text-slate-500">지금 선배들이 남긴 최신 강의평부터 확인해보세요.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [1, 2, 3].map((i) => <CourseCardSkeleton key={i} />)
            ) : (
              recentCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  showPreview
                  previewText={course.latestReviewContent}
                />
              ))
            )}
          </div>
        </section>

        {/* Honey GE Section */}
        <section className="rounded-[2rem] border border-[#005bac]/10 bg-white px-6 py-8 shadow-[0_12px_32px_rgba(0,91,172,0.05)] md:px-8">
          <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#04a1e2]">General Education</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">학점 보장! 꿀 교양 추천</h2>
            </div>
            <p className="text-sm font-medium text-slate-500">부담은 적고 만족도는 높은 교양 강의를 골랐습니다.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [1, 2, 3].map((i) => <CourseCardSkeleton key={i} />)
            ) : (
              honeyGECourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            )}
          </div>
        </section>

        {/* Major Recommended Section */}
        <section className="rounded-[2rem] border border-[#005bac]/10 bg-white px-6 py-8 shadow-[0_12px_32px_rgba(0,91,172,0.05)] md:px-8">
          <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0162b4]">Department Picks</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              <span className="text-[#005bac]">{user?.department || '컴퓨터공학과'}</span> 선배들의 추천
            </h2>
            </div>
            <p className="text-sm font-medium text-slate-500">우리 전공에서 먼저 찾게 되는 강의들을 모았습니다.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [1, 2, 3].map((i) => <CourseCardSkeleton key={i} />)
            ) : (
              majorCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
