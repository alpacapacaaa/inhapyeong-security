import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Lock, Plus, FileText, CalendarClock, ShoppingBag, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ReviewCard } from '../components/ReviewCard';
import { courseService, reviewService, userService } from '../api/api';
import {
  loadSelectedTimetableIds,
  loadTimetableCartIds,
  saveSelectedTimetableIds,
  saveTimetableCartIds,
  toggleStoredId,
} from '../data/timetableData';
import { Course, Review, User } from '../types/types';
import { toast } from 'sonner';
import { useCourseStats } from '../hooks/useCourseStats';
import { CourseRadarChart } from '../components/course/CourseRadarChart';
import { SyllabusModal } from '../components/course/SyllabusModal';
import { CourseDetailSkeleton } from '../components/course/CourseSkeleton';
import { compareSemesterLabel } from '../lib/semester';
import { StarRating } from '../components/StarRating';

export function CourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'latest' | 'highest' | 'lowest' | 'likes'>('latest');
  const [selectedSemester, setSelectedSemester] = useState('전체');
  const [cartIds, setCartIds] = useState<string[]>([]);

  const availableSemesters = ['전체', ...Array.from(new Set(reviews.map((review) => review.semester))).sort(compareSemesterLabel)];
  const filteredReviews = selectedSemester === '전체'
    ? reviews
    : reviews.filter((review) => review.semester === selectedSemester);
  const examReviews = filteredReviews.filter(
    (review) =>
      !!review.pastExamHelpfulness ||
      !!review.scopePredictability ||
      (review.studyResources?.length ?? 0) > 0 ||
      (review.problemStyles?.length ?? 0) > 0 ||
      !!review.examPrepTip ||
      (review.examTypes?.length ?? 0) > 0,
  );

  const { overallRating, statsData, statsLabels, isMajor } = useCourseStats(
    course || ({} as Course),
    filteredReviews
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [fetchedCourse, fetchedReviews, fetchedUser] = await Promise.all([
          courseService.getCourseById(id),
          reviewService.getReviewsByCourseId(id),
          userService.getCurrentUser(),
        ]);
        setCourse(fetchedCourse || null);
        setReviews(fetchedReviews);
        setUser(fetchedUser);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    setCartIds(loadTimetableCartIds());
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent py-8">
        <div className="mx-auto w-full max-w-[1360px] px-4 xl:px-6">
          <CourseDetailSkeleton />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">로그인이 필요합니다</h2>
          <p className="mb-8 font-medium leading-relaxed text-gray-600">로그인 후 강의평을 확인할 수 있습니다.</p>
          <div className="space-y-3">
            <Link to="/auth?mode=login" className="block w-full">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-14 rounded-2xl text-lg transition-all shadow-md hover:shadow-lg">
                로그인 하러가기
              </Button>
            </Link>
            <Link to="/" className="block w-full">
              <Button variant="ghost" className="w-full text-gray-500 hover:text-gray-800 h-12 rounded-xl font-semibold">
                메인으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 font-bold">강의를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const handlePurchaseAccess = async () => {
    try {
      const updatedUser = await userService.purchasePass();
      setUser(updatedUser);
      toast.success('열람권을 획득했습니다!');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('열람권 획득에 실패했습니다.');
      }
    }
  };

  // 리뷰 정렬 로직 적용
  const finalReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'latest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest') return a.rating - b.rating;
    if (sortBy === 'likes') return (b.likes || 0) - (a.likes || 0);
    return 0;
  });

  const reviewWriteLink = selectedSemester === '전체'
    ? `/review/write/${course.id}`
    : `/review/write/${course.id}?semester=${encodeURIComponent(selectedSemester)}`;
  const isInTimetableCart = cartIds.includes(course.id);

  const handleToggleTimetableCart = () => {
    const next = toggleStoredId(cartIds, course.id);
    setCartIds(next);
    saveTimetableCartIds(next);

    if (!next.includes(course.id)) {
      saveSelectedTimetableIds(loadSelectedTimetableIds().filter((savedId) => savedId !== course.id));
      toast.success('시간표 장바구니에서 제거했습니다.');
      return;
    }

    toast.success('시간표 장바구니에 담았습니다.');
  };

  return (
    <React.Fragment>
      {isSyllabusOpen && course && (
        <SyllabusModal course={course} onClose={() => setIsSyllabusOpen(false)} />
      )}

      <div className="min-h-screen">
        <div className="page-shell py-8">
          <div className="space-y-6">

            <div className="page-panel overflow-hidden p-5 lg:p-8">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_410px] xl:gap-8">
                <div className="flex flex-col border-b border-[rgba(15,23,42,0.08)] pb-6 xl:min-h-full xl:border-b-0 xl:border-r xl:border-[rgba(15,23,42,0.08)] xl:pr-8 xl:pb-0">
                  <div className="mb-5">
                    <p className="section-kicker">강의 정보</p>
                    <h1 className="mb-3 text-[1.95rem] font-black tracking-tight text-slate-900 md:text-[3.2rem]">
                      {course.name}
                    </h1>
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${isMajor ? 'border-[rgba(15,23,42,0.08)] bg-[#edf4ff] text-[#005bac]' : 'border-[rgba(15,23,42,0.08)] bg-[#f5f8fb] text-slate-700'}`}>
                        {course.category}
                      </span>
                      <span className="rounded-full border border-[rgba(15,23,42,0.08)] bg-[#f7fafc] px-2.5 py-1 text-[13px] text-slate-700">
                        {course.professor} 교수님
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-500 font-medium">{course.department}</span>
                    </p>
                  </div>

                  <div className="mt-auto flex flex-col">
                    <span className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">평균 평점</span>
                    <div className="flex items-end gap-2.5">
                      <span className="text-[3.55rem] font-black leading-none tracking-tighter text-slate-900 md:text-[4rem]">
                        {overallRating.toFixed(1)}
                      </span>
                      <span className="mb-1 text-base font-semibold text-slate-400 md:text-[1.05rem]">/ 5.0</span>
                    </div>
                    <div className="mt-3">
                      <StarRating
                        value={overallRating}
                        size="xl"
                        showValue={false}
                        reviewCount={reviews.length}
                        className="items-center"
                        reviewCountClassName="rounded-full border border-[rgba(15,23,42,0.08)] bg-[#f7fafc] px-3.5 py-1.5 text-sm font-semibold text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    <Button asChild className="h-11 w-full rounded-full px-5 text-sm font-semibold">
                      <Link to={reviewWriteLink}>
                        <Plus className="w-4 h-4 mr-1.5" />
                        강의평 남기기
                      </Link>
                    </Button>
                    <Button
                      onClick={() => setIsSyllabusOpen(true)}
                      variant="outline"
                      className="h-11 w-full rounded-full px-5 text-sm font-semibold text-slate-700"
                    >
                      <FileText className="w-4 h-4 mr-1.5 text-[#005bac]" />
                      강의계획서 보기
                    </Button>
                    <Button
                      onClick={handleToggleTimetableCart}
                      variant="outline"
                      className="h-11 w-full rounded-full px-5 text-sm font-semibold text-slate-700"
                    >
                      <ShoppingBag className="mr-1.5 h-4 w-4 text-[#005bac]" />
                      {isInTimetableCart ? '시간표 장바구니에서 빼기' : '시간표 장바구니 담기'}
                    </Button>
                    <Link to="/timetable" className="block w-full">
                      <Button
                        variant="outline"
                        className="h-11 w-full rounded-full px-5 text-sm font-semibold text-[#005bac]"
                      >
                        <CalendarClock className="mr-1.5 h-4 w-4" />
                        시간표 짜러 가기
                      </Button>
                    </Link>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="outline-chip px-3.5 py-1.5 text-[13px] font-semibold">
                      학기 {selectedSemester}
                    </span>
                    <span className="outline-chip px-3.5 py-1.5 text-[13px] font-semibold">
                      시험 정보 {examReviews.length}개
                    </span>
                  </div>
                </div>

                <div className="self-end rounded-[1.6rem] border border-[#dde5ef] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.04)] md:p-5">
                  <div className="mb-4">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#005bac]">Signature Stat</p>
                      <p className="mt-1 text-[1.05rem] font-black text-slate-950">강의 성향 요약</p>
                    </div>
                  </div>

                  <div className="rounded-[1.35rem] border border-[#e3eaf3] bg-[linear-gradient(180deg,#fafcff_0%,#f5f7fb_100%)] p-4">
                    <CourseRadarChart data={statsData} labels={statsLabels} />
                  </div>
                </div>
              </div>

            </div>
            {/* Access Gate (Logged In, No Pass) */}
            {!user.hasPass && (
              <Card className="mb-6 overflow-hidden rounded-[2rem] border border-[rgba(15,23,42,0.08)] bg-[#f7fafc] shadow-none">
                <CardContent className="p-8 md:p-10">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-[rgba(15,23,42,0.08)] bg-white shadow-sm">
                      <Lock className="w-10 h-10 text-[#005bac]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-3 text-2xl font-extrabold text-gray-900">
                        상세 강의평가를 보려면 열람권이 필요합니다
                      </h3>
                      <p className="mb-6 text-base font-medium leading-relaxed text-gray-700">
                        포인트로 열람권을 구매하거나 강의평을 작성해 이용할 수 있습니다.
                        <span className="ml-2 rounded-md bg-white px-2 py-0.5 text-lg text-[#005bac]">{user.points}P</span>
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <Button
                          onClick={handlePurchaseAccess}
                          disabled={user.points < 50}
                          className="h-14 rounded-full px-8 text-base font-extrabold disabled:opacity-50"
                        >
                          열람권 구매 (-50P)
                        </Button>
                        <Button asChild variant="outline" className="h-14 w-full rounded-full px-8 text-base font-extrabold text-[#005bac] sm:w-auto">
                          <Link to={reviewWriteLink}>
                            강의평 남기고 포인트 받기
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {user.hasPass && (
              <div className="space-y-8 pt-6">
                <div className="space-y-5 animate-in slide-in-from-bottom-4 fade-in duration-500">
                  <div className="flex flex-col gap-3 rounded-[1.55rem] border border-[#005bac]/10 bg-white px-5 py-4 shadow-[0_10px_24px_rgba(0,91,172,0.04)] md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center min-h-[44px]">
                      <h2 className="flex items-center gap-2 text-[1.35rem] font-extrabold text-slate-900">
                        <span className="inline-block h-5 w-1.5 rounded-full bg-[#1084e8]"></span>
                        {selectedSemester === '전체' ? '전체 강의평' : `${selectedSemester} 강의평`} <span className="text-[#005bac]">{finalReviews.length}</span>
                      </h2>
                    </div>

                    <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
                      <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                        <SelectTrigger className="w-full border-slate-200 bg-white sm:w-[160px]">
                          <SelectValue placeholder="학기 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSemesters.map((semester) => (
                            <SelectItem key={semester} value={semester}>
                              {semester}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                        <SelectTrigger className="w-full border-slate-200 bg-white sm:w-[150px]">
                          <SelectValue placeholder="정렬 방식" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="latest">최신 등록순</SelectItem>
                          <SelectItem value="likes">추천 많은순</SelectItem>
                          <SelectItem value="highest">별점 높은순</SelectItem>
                          <SelectItem value="lowest">별점 낮은순</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {finalReviews.length > 0 && examReviews.length === 0 && (
                      <div className="rounded-[1.25rem] border border-[rgba(15,23,42,0.08)] bg-[#f8fbff] px-4 py-3.5">
                        <p className="text-sm font-bold text-slate-800">
                          {selectedSemester === '전체'
                            ? '아직 시험 정보가 포함된 리뷰는 없습니다.'
                            : `${selectedSemester}에는 시험 정보가 포함된 리뷰가 아직 없습니다.`}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          기본 리뷰는 확인할 수 있고, 시험 방식이나 족보 정보는 다음 작성자가 채워줄 수 있습니다.
                        </p>
                      </div>
                    )}
                    {finalReviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>

                  {finalReviews.length === 0 && (
                    <Card className="rounded-[1.6rem] border-dashed border-2 border-slate-200 bg-transparent shadow-none">
                      <CardContent className="p-16 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                          <BookOpen className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">
                          {selectedSemester === '전체' ? '아직 등록된 강의평가가 없습니다' : `${selectedSemester} 리뷰가 아직 없습니다`}
                        </h3>
                        <p className="text-slate-500 mb-6 font-medium">
                          {selectedSemester === '전체'
                            ? '이 강의의 첫 번째 리뷰어가 되어 후배들을 도와주세요!'
                            : '다른 학기 리뷰는 남아 있을 수 있지만, 선택한 학기의 리뷰는 아직 없습니다.'}
                        </p>
                        <Button asChild className="h-12 rounded-xl bg-gradient-to-r from-[#005bac] to-[#1084e8] px-8 font-bold text-white hover:from-[#0162b4] hover:to-[#04a1e2]">
                          <Link to={reviewWriteLink}>
                            {selectedSemester === '전체' ? '첫 번째 강의평 남기기' : `${selectedSemester} 강의평 남기기`}
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
