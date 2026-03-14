import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Star, Lock, Plus, BookOpen, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ReviewCard } from '../components/ReviewCard';
import { courseService, reviewService, userService } from '../api/api';
import { Course, Review, User } from '../types/types';
import { toast } from 'sonner';
import { useCourseStats } from '../hooks/useCourseStats';
import { CourseRadarChart } from '../components/course/CourseRadarChart';
import { SyllabusModal } from '../components/course/SyllabusModal';
import { CourseDetailSkeleton } from '../components/course/CourseSkeleton';

const compareSemester = (a: string, b: string) => {
  const [aYear, aTermRaw] = a.replace('학기', '').split('-');
  const [bYear, bTermRaw] = b.replace('학기', '').split('-');
  const aYearNumber = Number(aYear);
  const bYearNumber = Number(bYear);
  const aTerm = Number(aTermRaw);
  const bTerm = Number(bTermRaw);

  if (aYearNumber !== bYearNumber) {
    return bYearNumber - aYearNumber;
  }

  return bTerm - aTerm;
};

export function CourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reviews' | 'exams'>('reviews');
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
  const [expandedExams, setExpandedExams] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'latest' | 'highest' | 'lowest' | 'likes'>('latest');
  const [selectedSemester, setSelectedSemester] = useState('전체');

  const availableSemesters = ['전체', ...Array.from(new Set(reviews.map((review) => review.semester))).sort(compareSemester)];
  const filteredReviews = selectedSemester === '전체'
    ? reviews
    : reviews.filter((review) => review.semester === selectedSemester);
  const examReviews = filteredReviews.filter(
    (review) =>
      !!review.examInfo ||
      (review.examKeywords?.length ?? 0) > 0 ||
      (review.examTypes?.length ?? 0) > 0,
  );

  const { overallRating, statsData, statsLabels, isMajor } = useCourseStats(
    course || ({} as Course),
    filteredReviews
  );

  const toggleExam = (reviewId: string) => {
    setExpandedExams(prev =>
      prev.includes(reviewId) ? prev.filter(i => i !== reviewId) : [...prev, reviewId]
    );
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent py-8">
        <div className="container mx-auto px-4">
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
          <p className="text-gray-600 mb-8 leading-relaxed font-medium">
            인하대 재학생만 강의평가를 열람할 수 있습니다.<br />
            로그인하고 입체적인 프리미엄 리뷰를 확인해보세요!
          </p>
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

  return (
    <React.Fragment>
      {isSyllabusOpen && course && (
        <SyllabusModal course={course} onClose={() => setIsSyllabusOpen(false)} />
      )}

      <div className="min-h-screen bg-transparent">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">

            <div className="overflow-hidden rounded-[2.5rem] border border-[#005bac]/10 bg-white p-6 shadow-[0_20px_60px_rgba(0,91,172,0.08)] lg:p-10">
              <div className="flex flex-col gap-8 md:flex-row lg:gap-14">

                {/* 왼쪽: 총점 및 과목 정보 */}
                <div className="flex flex-1 flex-col justify-center border-b border-[#005bac]/10 pb-8 md:border-b-0 md:border-r md:border-[#005bac]/10 md:pr-8 md:pb-0">
                  <div className="mb-8">
                    <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#1084e8]">
                      Course Archive
                    </p>
                    <h1 className="mb-4 text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
                      {course.name}
                    </h1>
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
                      <span className={`rounded-full border px-3 py-1 text-xs font-extrabold ${isMajor ? 'border-[#1084e8]/15 bg-[#edf7ff] text-[#005bac]' : 'border-[#04a1e2]/15 bg-[#ecfbff] text-[#047fb2]'}`}>
                        {course.category}
                      </span>
                      <span className="rounded-full border border-[#005bac]/10 bg-[#f8fcff] px-3 py-1 text-slate-700">
                        {course.professor} 교수님
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-500 font-medium">{course.department}</span>
                    </p>
                  </div>

                  <div className="flex flex-col mt-auto">
                    <span className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Overall Rating</span>
                    <div className="flex items-end gap-2">
                      <span className="text-6xl font-black leading-none tracking-tighter text-slate-900">{overallRating.toFixed(1)}</span>
                      <span className="text-xl text-slate-400 font-semibold mb-1.5">/ 5.0</span>
                    </div>
                    <div className="flex items-center mt-3">
                      {Array.from({ length: 5 }, (_, i) => i < Math.round(overallRating)).map((filled, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${filled ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 fill-slate-100'}`}
                        />
                      ))}
                      <span className="ml-3 rounded-full border border-[#005bac]/10 bg-[#f8fcff] px-3 py-1 text-xs font-semibold text-slate-500">
                        {reviews.length} 리뷰
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-3">
                    <Link to={reviewWriteLink} className="block w-full">
                      <Button className="h-12 w-full rounded-full bg-gradient-to-r from-[#005bac] to-[#1084e8] px-6 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(16,132,232,0.24)] transition-all hover:from-[#0162b4] hover:to-[#04a1e2]">
                        <Plus className="w-4 h-4 mr-1.5" />
                        강의평가 작성하기
                      </Button>
                    </Link>
                    <Button
                      onClick={() => setIsSyllabusOpen(true)}
                      variant="outline"
                      className="h-12 w-full rounded-full border-[#005bac]/10 bg-[#f8fcff] px-6 text-sm font-bold text-slate-700 transition-all hover:bg-[#edf7ff]"
                    >
                      <FileText className="w-4 h-4 mr-1.5 text-[#1084e8]" />
                      강의계획서 보기
                    </Button>
                  </div>
                </div>

                {/* 오른쪽: 육각형 레이더 차트 */}
                <CourseRadarChart data={statsData} labels={statsLabels} />
              </div>

            </div>
            {/* Access Gate (Logged In, No Pass) */}
            {!user.hasPass && (
              <Card className="mb-6 overflow-hidden rounded-[2rem] border border-[#1084e8]/15 bg-gradient-to-br from-[#edf7ff] to-[#f8fdff] shadow-[0_12px_32px_rgba(0,91,172,0.06)]">
                <CardContent className="p-8 md:p-10">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-[#1084e8]/15 bg-white shadow-sm">
                      <Lock className="w-10 h-10 text-[#005bac]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-3 text-2xl font-extrabold text-gray-900">
                        상세 강의평가를 보려면 열람권이 필요합니다
                      </h3>
                      <p className="mb-6 text-base font-medium leading-relaxed text-gray-700">
                        강의평 하나를 작성하면 한 달간 모든 강의를 <strong className="text-[#005bac] underline decoration-[#11ebff] underline-offset-4">무료로 무제한 패스</strong> 하실 수 있어요!<br className="hidden md:block" />
                        (현재 내 포인트: <strong className="rounded-md bg-white px-2 py-0.5 text-lg text-[#005bac]">{user.points}P</strong>)
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <Button
                          onClick={handlePurchaseAccess}
                          disabled={user.points < 50}
                          className="h-14 rounded-full bg-gradient-to-r from-[#005bac] to-[#1084e8] px-8 text-base font-extrabold text-white transition-all hover:from-[#0162b4] hover:to-[#04a1e2] disabled:opacity-50"
                        >
                          열람권 구매 (-50P)
                        </Button>
                        <Link to={reviewWriteLink}>
                          <Button variant="outline" className="h-14 w-full rounded-full border-[#1084e8]/15 bg-white px-8 text-base font-extrabold text-[#005bac] hover:bg-[#edf7ff] hover:text-[#0162b4] sm:w-auto">
                            강의평 남기고 포인트 받기
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 🔘 Reviews & Exam Info Tabs */}
            {user.hasPass && (
              <div className="space-y-8 pt-6">

                {/* Pill-shaped Tab Navigation */}
                <div className="mx-auto flex w-full max-w-md rounded-full border border-[#005bac]/10 bg-[#eaf5fc] p-1.5 shadow-inner">
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3.5 text-[15px] font-bold transition-all duration-300 ${activeTab === 'reviews'
                      ? 'bg-white text-[#005bac] shadow-sm ring-1 ring-[#1084e8]/10'
                      : 'text-slate-500 hover:bg-[#f4fbff] hover:text-slate-700'
                      }`}
                  >
                    <BookOpen className={`w-4 h-4 ${activeTab === 'reviews' ? 'text-[#1084e8]' : 'text-slate-400'}`} />
                    강의평가 <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-md font-extrabold">{reviews.length}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('exams')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3.5 text-[15px] font-bold transition-all duration-300 ${activeTab === 'exams'
                      ? 'bg-white text-[#005bac] shadow-sm ring-1 ring-[#1084e8]/10'
                      : 'text-slate-500 hover:bg-[#f4fbff] hover:text-slate-700'
                      }`}
                  >
                    <Lock className={`w-4 h-4 ${activeTab === 'exams' ? 'text-[#1084e8]' : 'text-slate-400'}`} />
                    시험·족보 <span className="bg-amber-100 text-amber-600 text-xs px-2 py-0.5 rounded-md font-extrabold">2</span>
                  </button>
                </div>

                {/* 탭 내용 1: 🎉 REVIEWS */}
                {activeTab === 'reviews' && (
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="flex flex-col md:flex-row items-center justify-between px-2 gap-4">
                      <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-indigo-500 rounded-full inline-block"></span>
                        {selectedSemester === '전체' ? '전체 강의평' : `${selectedSemester} 강의평`} <span className="text-indigo-600">{finalReviews.length}</span>
                      </h2>

                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                          <SelectTrigger className="w-[150px] bg-white border-slate-200">
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
                          <SelectTrigger className="w-[130px] bg-white border-slate-200">
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
                      {finalReviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </div>

                    {finalReviews.length === 0 && (
                      <Card className="rounded-3xl border-dashed border-2 border-slate-200 bg-transparent">
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
                          <Link to={reviewWriteLink}>
                            <Button className="font-bold bg-indigo-600 hover:bg-indigo-700 rounded-xl h-12 px-8">
                              {selectedSemester === '전체' ? '첫 번째 강의평 작성하기' : `${selectedSemester} 강의평 작성하기`}
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* 탭 내용 2: 💯 EXAM INFO (Mock Data) + BLUR LOCK */}
                {activeTab === 'exams' && (
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="flex flex-col md:flex-row items-center justify-between px-2 gap-3">
                      <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-amber-500 rounded-full inline-block"></span>
                        {selectedSemester === '전체' ? '시험/족보 정보' : `${selectedSemester} 시험/족보 정보`} <span className="text-amber-600">{examReviews.length}</span>
                      </h2>

                      <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                        <SelectTrigger className="w-[150px] bg-white border-slate-200">
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
                    </div>

                    {examReviews.map((review) => (
                      <Card
                        key={review.id}
                        className={`rounded-3xl border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group ${
                          expandedExams.includes(review.id) ? 'ring-2 ring-amber-400' : ''
                        }`}
                        onClick={() => toggleExam(review.id)}
                      >
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-amber-500"></div>
                        <CardContent className="p-6 md:p-8">
                          <div className="flex justify-between items-start mb-4 gap-3">
                            <div className="flex flex-wrap gap-2">
                              <span className="bg-amber-100 text-amber-700 font-extrabold px-3 py-1 rounded-md text-sm tracking-tight">{review.semester}</span>
                              {review.examTypes?.[0] && (
                                <span className="bg-slate-100 text-slate-600 font-extrabold px-3 py-1 rounded-md text-sm tracking-tight">
                                  {review.examTypes[0]}
                                </span>
                              )}
                            </div>
                            <span className="text-slate-400 text-sm font-semibold flex items-center gap-1.5 shrink-0">
                              {expandedExams.includes(review.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </span>
                          </div>

                          <h4 className="text-[17px] font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">
                            {review.examInfo || '시험/족보 관련 정보가 포함된 리뷰입니다.'}
                          </h4>

                          {expandedExams.includes(review.id) && (
                            <div className="mt-5 pt-5 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                              {review.examTypes && review.examTypes.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {review.examTypes.map((type) => (
                                    <span key={type} className="bg-white px-2.5 py-1 rounded-md text-xs font-bold text-slate-600 shadow-sm border border-slate-100">
                                      {type}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {review.examInfo && (
                                <p className="text-slate-600 leading-relaxed font-medium">
                                  {review.examInfo}
                                </p>
                              )}

                              {review.examKeywords && review.examKeywords.length > 0 && (
                                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100/50">
                                  <h5 className="font-extrabold text-amber-800 mb-2 flex items-center text-sm">
                                    <Star className="w-4 h-4 mr-1.5 fill-amber-500 text-amber-500" />
                                    많이 나온 키워드
                                  </h5>
                                  <div className="flex gap-2 flex-wrap">
                                    {review.examKeywords.map((keyword) => (
                                      <span key={keyword} className="bg-white px-2.5 py-1 rounded-md text-xs font-bold text-slate-600 shadow-sm">
                                        {keyword}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    {examReviews.length === 0 && (
                      <Card className="rounded-3xl border-dashed border-2 border-amber-200 bg-transparent">
                        <CardContent className="p-16 text-center">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <FileText className="w-8 h-8 text-amber-300" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-700 mb-2">
                            {selectedSemester === '전체' ? '아직 시험/족보 정보가 없습니다' : `${selectedSemester} 시험/족보 정보가 없습니다`}
                          </h3>
                          <p className="text-slate-500 mb-6 font-medium">
                            시험 방식이나 자주 나오는 키워드를 포함해 강의평을 남기면 후배들에게 더 큰 도움이 됩니다.
                          </p>
                          <Link to={reviewWriteLink}>
                            <Button className="font-bold bg-amber-500 hover:bg-amber-600 rounded-xl h-12 px-8">
                              시험 정보 포함해서 강의평 작성하기
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
