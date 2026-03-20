import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from './components/ui/sonner';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { ReviewWritePage } from './pages/ReviewWritePage';
import { MyPage } from './pages/MyPage';
import { AuthPage } from './pages/AuthPage';
import { EmailVerifyPage } from './pages/EmailVerifyPage';
import { TimetablePage } from './pages/TimetablePage';
import { toast } from 'sonner';
import { userService } from './api/api';
import { Loader2 } from 'lucide-react';
import { RouteErrorBoundary } from './components/RouteErrorBoundary';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await userService.getCurrentUser();
        setIsLoggedIn(!!user);
      } catch (error) {
        console.error('Failed to check auth:', error);
        toast.error('서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요.');
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await userService.logout();
      toast.success('로그아웃 되었습니다.');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('로그아웃 중 오류가 발생했습니다.');
    } finally {
      setIsLoggedIn(false);
    }
  };

  const handleAccountDeleted = () => {
    setIsLoggedIn(false);
  };

  if (isLoggedIn === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <div className="flex items-center gap-3 rounded-full border border-[#005bac]/10 bg-white/90 px-5 py-3 text-sm font-semibold text-slate-600 shadow-[0_16px_40px_rgba(0,91,172,0.08)] backdrop-blur">
          <Loader2 className="h-5 w-5 animate-spin text-[#1084e8]" />
          서비스를 불러오는 중입니다
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-transparent text-foreground">
        <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/course/:id" element={<CourseDetailPage />} />
          <Route
            path="/review/write/:courseId"
            element={
              <RouteErrorBoundary>
                <ReviewWritePage />
              </RouteErrorBoundary>
            }
          />
          <Route path="/mypage" element={isLoggedIn ? <MyPage onAccountDeleted={handleAccountDeleted} /> : <Navigate to="/auth?mode=login" />} />
          <Route path="/timetable" element={isLoggedIn ? <TimetablePage /> : <Navigate to="/auth?mode=login" />} />
          <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
          <Route path="/auth/email/verify" element={<EmailVerifyPage />} />
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}
