import { Link, useNavigate, useLocation } from 'react-router';
import { useState } from 'react';
import { Button } from './ui/button';
import { Search, LayoutGrid } from 'lucide-react';

interface HeaderProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export function Header({ isLoggedIn = false, onLogout }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');

  // 메인 페이지(/)에서는 헤더 검색창을 숨깁니다 (메인 중앙 검색창과 중복 방지)
  const isHomePage = location.pathname === '/';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#005bac]/10 bg-[#f4fbff]/95 backdrop-blur">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-8">

          {/* Left Section: Logo + Search Bar */}
          <div className="flex items-center gap-6 flex-1 max-w-2xl">
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="h-10 w-1.5 rounded-full bg-[#005bac] transition-transform duration-300 group-hover:scale-y-110" />
              <div className="flex flex-col leading-none">
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0162b4]">Inha Review Archive</span>
                <span className="text-xl font-black tracking-tight text-slate-900">인하평</span>
              </div>
            </Link>

            {/* Only show 'Browse Courses' if NOT on the search page */}
            {location.pathname !== '/search' && (
              <Link
                to="/search"
                className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#005bac]/10 px-4 py-2 text-[14px] font-bold text-slate-700 transition-all hover:border-[#005bac]/25 hover:bg-white"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>강의 둘러보기</span>
              </Link>
            )}

            {/* Integrated Search Bar (Shown everywhere EXCEPT HomePage) */}
            {!isHomePage && (
              <div className="hidden md:flex items-center gap-4 flex-1">
                {/* Vertical Separator */}
                <div className="w-px h-5 bg-slate-200" />

                {/* Academic Season Badge */}
                <div className="flex shrink-0 items-center gap-2 rounded-full border border-[#1084e8]/15 bg-white px-3 py-1.5">
                  <span className="inline-flex h-2 w-2 rounded-full bg-[#11ebff] shadow-[0_0_12px_rgba(17,235,255,0.7)]"></span>
                  <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#005bac]">수강신청 시즌</span>
                </div>

                {/* Integrated Search Bar */}
                <form onSubmit={handleSearch} className="relative flex-1 group">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-slate-400 transition-colors group-focus-within:text-[#1084e8]" />
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="강의명, 교수님 성함으로 검색해보세요"
                    className="h-11 w-full rounded-full border border-[#005bac]/10 bg-white pl-10 pr-4 text-sm font-medium text-slate-700 placeholder:font-normal placeholder:text-slate-400 transition-all duration-200 focus:border-[#1084e8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1084e8]/15"
                  />
                </form>
              </div>
            )}
          </div>

          {/* Right Section: Auth & MyPage */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Link to="/mypage">
                  <Button variant="ghost" className="h-10 rounded-full px-4 text-sm font-bold text-slate-700 hover:bg-white">마이페이지</Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={onLogout}
                  className="h-10 rounded-full px-4 text-sm font-semibold text-slate-400 hover:bg-red-50 hover:text-red-500"
                >
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth?mode=login">
                  <Button variant="ghost" className="h-10 rounded-full px-4 text-sm font-bold text-slate-700 hover:bg-white">로그인</Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button className="h-10 rounded-full bg-gradient-to-r from-[#005bac] to-[#1084e8] px-6 text-sm font-bold text-white shadow-[0_10px_24px_rgba(16,132,232,0.24)] hover:from-[#0162b4] hover:to-[#04a1e2]">회원가입</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
