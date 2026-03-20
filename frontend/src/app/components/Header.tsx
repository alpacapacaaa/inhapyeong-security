import { Link, useNavigate, useLocation } from 'react-router';
import { useState } from 'react';
import { Button } from './ui/button';
import { Search, LayoutGrid, CalendarClock } from 'lucide-react';

interface HeaderProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export function Header({ isLoggedIn = false, onLogout }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');

  const isHomePage = location.pathname === '/';
  const navItems = [
    { to: '/search', label: '강의 둘러보기', icon: LayoutGrid },
    ...(isLoggedIn ? [{ to: '/timetable', label: '시간표', icon: CalendarClock }] : []),
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(15,23,42,0.08)] bg-[rgba(243,246,248,0.86)] backdrop-blur-xl">
      <div className="page-shell flex items-center justify-between gap-4 py-4">
        <div className="flex min-w-0 flex-1 items-center gap-4 lg:gap-6">
          <Link to="/" className="group flex shrink-0 items-center gap-3">
            <div className="flex items-center gap-2 text-slate-950">
              <span className="text-xl font-black tracking-tight">인하평</span>
              <span className="text-slate-300">|</span>
              <span className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500 transition-colors group-hover:text-[#005bac]">
                Archive
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 xl:flex">
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;

              return (
                <Link
                  key={to}
                  to={to}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                    isActive
                      ? 'border border-[rgba(15,23,42,0.08)] bg-white text-[#005bac] shadow-[0_10px_24px_rgba(15,23,42,0.04)]'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {!isHomePage && (
            <form onSubmit={handleSearch} className="hidden min-w-0 flex-1 md:block">
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                  <Search className="h-4 w-4 text-slate-400 transition-colors group-focus-within:text-[#005bac]" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="강의명, 교수님, 학과로 찾아보세요"
                  className="h-12 w-full rounded-full border border-[rgba(15,23,42,0.08)] bg-white pl-11 pr-4 text-sm font-medium text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-all duration-200 placeholder:text-slate-400 focus:border-[#005bac] focus:outline-none focus:ring-4 focus:ring-[#005bac]/10"
                />
              </div>
            </form>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!isHomePage && (
            <Link
              to="/search"
              className="hidden items-center gap-2 rounded-full border border-[rgba(15,23,42,0.08)] bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-all hover:border-[#005bac]/18 hover:bg-white lg:inline-flex xl:hidden"
            >
              <LayoutGrid className="h-4 w-4" />
              강의 둘러보기
            </Link>
          )}

          {isLoggedIn ? (
            <>
              <Link to="/mypage">
                <Button variant="ghost" className="h-10 rounded-full px-4 text-sm font-bold text-slate-700 hover:bg-white">
                  마이페이지
                </Button>
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
                <Button variant="ghost" className="h-10 rounded-full px-4 text-sm font-bold text-slate-700 hover:bg-white">
                  로그인
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button className="h-10 rounded-full px-5 text-sm font-bold">
                  회원가입
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
