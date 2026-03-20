import { useState } from 'react';
import {
  ArrowRight,
  CalendarRange,
  ChartNoAxesColumn,
  ChevronRight,
  LayoutGrid,
  MoonStar,
  Search,
  Sparkles,
  SunMedium,
  SwatchBook,
} from 'lucide-react';

type ConceptId = 'hybrid' | 'editorial' | 'system' | 'studio';
type ThemeMode = 'light' | 'dark';

type Concept = {
  id: ConceptId;
  label: string;
  eyebrow: string;
  title: string;
  summary: string;
  why: string;
  tone: string;
  strengths: string[];
  fit: {
    identity: number;
    product: number;
    darkMode: number;
  };
};

const concepts: Concept[] = [
  {
    id: 'hybrid',
    label: 'Recommended Hybrid',
    eyebrow: 'Best Fit',
    title: 'Archive Core + Product Surface',
    summary: '첫인상은 브랜드답게, 탐색 경험은 빠르게. 홈과 상세는 더 인상적으로, 검색과 시간표는 더 기능적으로 가져갑니다.',
    why: '서비스 느낌은 달라지지만 구조를 거의 버리지 않아도 돼서 실제 전환에 가장 강합니다.',
    tone: '차가운 뉴트럴, 밀도 있는 레이아웃, 인하 블루 포인트',
    strengths: ['브랜드와 기능의 균형이 좋다', '다크모드 전환이 자연스럽다', '실제 사이트로 옮기기 쉽다'],
    fit: { identity: 5, product: 5, darkMode: 5 },
  },
  {
    id: 'editorial',
    label: 'Editorial Archive',
    eyebrow: 'Option 1',
    title: '기록물처럼 읽히는 강의평',
    summary: '카드와 버튼보다 타이포와 흐름이 먼저 보이게 설계합니다. 후기 읽기 경험이 중심입니다.',
    why: 'AI가 만든 듯한 랜딩 느낌을 가장 강하게 지울 수 있는 방향입니다.',
    tone: '슬레이트 타이포, 조용한 표면, 큐레이션된 여백',
    strengths: ['리뷰 콘텐츠가 돋보인다', '브랜드 신뢰감이 높다', '홈과 상세 화면에 강하다'],
    fit: { identity: 5, product: 3, darkMode: 4 },
  },
  {
    id: 'system',
    label: 'Product System',
    eyebrow: 'Option 2',
    title: '최신 SaaS 감도의 구조 재해석',
    summary: '레이아웃은 더 과감하게 비대칭으로, 필터와 결과는 더 빠르게 읽히게. Linear/Vercel 계열의 긴장감을 참고한 방향입니다.',
    why: '기능 중심 서비스라는 점이 즉시 드러나고, 검색과 시간표 같은 화면에서 힘을 발휘합니다.',
    tone: '하드 엣지, 촘촘한 정보층, 밝고 어두운 표면 대비',
    strengths: ['탐색성과 속도감이 좋다', '블록 구조가 최신 제품처럼 보인다', '다크모드에서 특히 강하다'],
    fit: { identity: 4, product: 5, darkMode: 5 },
  },
  {
    id: 'studio',
    label: 'Campus Studio',
    eyebrow: 'Option 3',
    title: '우리만의 시그니처를 전면에',
    summary: '캠퍼스 서비스라는 정체성을 더 강하게 밀어붙이고, 한눈에 기억되는 히어로와 구성을 만듭니다.',
    why: '브랜드 존재감은 가장 강하지만, 실제 서비스 전체 적용에는 강약 조절이 필요합니다.',
    tone: '대비 강한 헤드라인, 포스터 같은 블록, 큐레이션형 섹션',
    strengths: ['우리 사이트라는 인상이 강하다', '홍보성 랜딩에 강하다', '대표 화면이 기억에 남는다'],
    fit: { identity: 5, product: 3, darkMode: 4 },
  },
];

function ScoreBar({ value, mode }: { value: number; mode: ThemeMode }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={`h-2.5 w-8 rounded-full ${index < value ? 'bg-[#0a6ad6]' : mode === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}
        />
      ))}
    </div>
  );
}

function PreviewFrame({
  mode,
  eyebrow,
  title,
  children,
}: {
  mode: ThemeMode;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`overflow-hidden rounded-[2rem] border ${
        mode === 'dark'
          ? 'border-white/10 bg-[#0c1420] shadow-[0_24px_70px_rgba(0,0,0,0.35)]'
          : 'border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]'
      }`}
    >
      <div
        className={`flex items-center justify-between border-b px-5 py-3 ${
          mode === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-[#f7fafe]'
        }`}
      >
        <div>
          <p className={`text-[10px] font-black uppercase tracking-[0.24em] ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{eyebrow}</p>
          <h3 className={`mt-1 text-lg font-black tracking-tight ${mode === 'dark' ? 'text-white' : 'text-slate-950'}`}>{title}</h3>
        </div>
        <div className="flex gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${mode === 'dark' ? 'bg-white/15' : 'bg-slate-300'}`} />
          <span className={`h-2.5 w-2.5 rounded-full ${mode === 'dark' ? 'bg-white/15' : 'bg-slate-300'}`} />
          <span className="h-2.5 w-2.5 rounded-full bg-[#0a6ad6]" />
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function SemesterSpine({ mode }: { mode: ThemeMode }) {
  const items = [
    { term: '2024-2', score: '4.1', note: '과제 많음' },
    { term: '2025-1', score: '4.4', note: '시험 예측 가능' },
    { term: '2025-2', score: '4.7', note: '설명력 호평' },
  ];

  return (
    <div
      className={`rounded-[1.5rem] border p-4 ${
        mode === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-[#f6f9fc]'
      }`}
    >
      <div className="flex items-center gap-2">
        <CalendarRange className="h-4 w-4 text-[#0a6ad6]" />
        <p className={`text-sm font-black ${mode === 'dark' ? 'text-white' : 'text-slate-950'}`}>Semester Spine</p>
      </div>
      <p className={`mt-2 text-sm leading-6 ${mode === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
        같은 강의를 학기별로 이어서 보여주는 인하평 전용 시그니처. 이 한 요소만 있어도 우리 서비스라는 인상이 바로 생깁니다.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.term}
            className={`rounded-[1.2rem] border p-3 ${
              mode === 'dark' ? 'border-white/10 bg-[#0f1b2b]' : 'border-slate-200 bg-white'
            }`}
          >
            <p className={`text-[11px] font-black uppercase tracking-[0.16em] ${mode === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{item.term}</p>
            <p className={`mt-2 text-2xl font-black ${mode === 'dark' ? 'text-white' : 'text-slate-950'}`}>{item.score}</p>
            <p className={`mt-1 text-sm ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HybridPreview({ mode }: { mode: ThemeMode }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
      <PreviewFrame mode={mode} eyebrow="Home / Hero" title="브랜드는 크게, 정보는 즉시">
        <div
          className={`rounded-[1.7rem] border p-6 ${
            mode === 'dark'
              ? 'border-white/10 bg-[linear-gradient(135deg,#0e1826_0%,#121f34_100%)]'
              : 'border-slate-200 bg-[linear-gradient(135deg,#f7fbff_0%,#edf4fb_100%)]'
          }`}
        >
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0a6ad6]">Inha Review Archive</p>
              <h4 className={`mt-3 text-4xl font-black leading-[1.04] tracking-tight ${mode === 'dark' ? 'text-white' : 'text-slate-950'}`}>
                강의평을,
                <br />
                이번 학기의 판단 도구로.
              </h4>
              <p className={`mt-4 max-w-xl text-sm leading-7 ${mode === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                첫 화면은 우리 브랜드를 강하게 보여주고, 바로 아래부터는 검색과 큐레이션이 이어지는 구조입니다.
              </p>
              <div
                className={`mt-5 flex items-center gap-3 rounded-full border px-4 py-3 ${
                  mode === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white'
                }`}
              >
                <Search className="h-4 w-4 text-slate-400" />
                <span className={`text-sm ${mode === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>강의명, 교수명, 학과로 검색</span>
              </div>
            </div>

            <div className="grid gap-3">
              <div
                className={`rounded-[1.4rem] border p-4 ${
                  mode === 'dark' ? 'border-white/10 bg-[#0d1724]' : 'border-slate-200 bg-white'
                }`}
              >
                <p className={`text-[11px] font-black uppercase tracking-[0.18em] ${mode === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Hot This Week</p>
                <p className={`mt-2 text-2xl font-black ${mode === 'dark' ? 'text-white' : 'text-slate-950'}`}>자료구조</p>
                <p className={`mt-1 text-sm ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>최동욱 교수님 · 리뷰 42개</p>
              </div>
              <div className="rounded-[1.4rem] bg-[#0a6ad6] p-4 text-white">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/70">Signature</p>
                <p className="mt-2 text-lg font-black">학기별 흐름을 한 줄로</p>
                <p className="mt-2 text-sm leading-6 text-white/84">같은 강의를 여러 학기 리뷰로 이어보는 경험을 핵심 브랜딩으로 밀어붙입니다.</p>
              </div>
            </div>
          </div>
        </div>
      </PreviewFrame>

      <div className="grid gap-5">
        <PreviewFrame mode={mode} eyebrow="Search / Results" title="검색 화면은 더 대담하게 비대칭">
          <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
            <div
              className={`rounded-[1.5rem] border p-4 ${
                mode === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-[#f6f9fc]'
              }`}
            >
              <p className={`text-[11px] font-black uppercase tracking-[0.16em] ${mode === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Filters</p>
              <div className="mt-3 space-y-2">
                {['전공 / 교양', '개설 학기', '교수님', '점수 범위'].map((item) => (
                  <div
                    key={item}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                      mode === 'dark' ? 'bg-[#0f1b2b] text-slate-300' : 'bg-white text-slate-700'
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {[
                ['운영체제', '박영희 교수님', '4.5', '설명력 강함'],
                ['자료구조', '최동욱 교수님', '4.3', '시험 예측 가능'],
              ].map(([name, professor, score, meta]) => (
                <div
                  key={name}
                  className={`rounded-[1.5rem] border p-4 ${
                    mode === 'dark' ? 'border-white/10 bg-[#0d1724]' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-xl font-black ${mode === 'dark' ? 'text-white' : 'text-slate-950'}`}>{name}</p>
                      <p className={`mt-1 text-sm ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{professor}</p>
                    </div>
                    <div className="rounded-2xl bg-[#0a6ad6] px-4 py-2 text-white">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/75">Score</p>
                      <p className="mt-1 text-xl font-black">{score}</p>
                    </div>
                  </div>
                  <p className={`mt-3 text-sm ${mode === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>{meta}</p>
                </div>
              ))}
            </div>
          </div>
        </PreviewFrame>

        <SemesterSpine mode={mode} />
      </div>
    </div>
  );
}

function EditorialPreview({ mode }: { mode: ThemeMode }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <PreviewFrame mode={mode} eyebrow="Mood" title="화면보다 읽는 흐름">
        <div
          className={`rounded-[1.6rem] border p-5 ${
            mode === 'dark' ? 'border-white/10 bg-[#101826]' : 'border-slate-200 bg-[#f7fafe]'
          }`}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0a6ad6]">Editorial Archive</p>
          <h4 className={`mt-3 text-3xl font-black leading-tight ${mode === 'dark' ? 'text-white' : 'text-slate-950'}`}>
            정보는 조용하게,
            <br />
            인상은 선명하게.
          </h4>
        </div>
      </PreviewFrame>

      <PreviewFrame mode={mode} eyebrow="Review" title="후기 카드가 메인 콘텐츠">
        <div
          className={`rounded-[1.6rem] border p-5 ${
            mode === 'dark' ? 'border-white/10 bg-[#0d1724]' : 'border-slate-200 bg-white'
          }`}
        >
          <p className={`text-[11px] font-black uppercase tracking-[0.16em] ${mode === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Featured Review</p>
          <p className={`mt-4 text-sm leading-7 ${mode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
            강의는 빠르게 지나가지만, 어떤 학기에는 유난히 평가가 달라집니다. 이 흐름을 읽는 서비스처럼 보이게 만드는 쪽입니다.
          </p>
        </div>
      </PreviewFrame>

      <PreviewFrame mode={mode} eyebrow="Identity" title="시그니처 요소 결합">
        <SemesterSpine mode={mode} />
      </PreviewFrame>
    </div>
  );
}

function ProductPreview({ mode }: { mode: ThemeMode }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
      <PreviewFrame mode={mode} eyebrow="System Layout" title="요즘 제품 사이트 같은 긴장감">
        <div className="grid gap-4 lg:grid-cols-[1fr_0.86fr]">
          <div className="grid gap-4">
            <div className="rounded-[1.6rem] bg-[#0a6ad6] p-5 text-white">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/75">Product Rail</p>
              <h4 className="mt-3 text-3xl font-black leading-tight">검색, 비교, 장바구니까지 한 흐름</h4>
            </div>
            <div
              className={`rounded-[1.6rem] border p-5 ${
                mode === 'dark' ? 'border-white/10 bg-[#0d1724]' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                {['필터', '결과', '시간표'].map((item) => (
                  <div
                    key={item}
                    className={`rounded-[1.2rem] p-4 text-center text-sm font-black ${
                      mode === 'dark' ? 'bg-[#111d2d] text-slate-300' : 'bg-[#f5f8fb] text-slate-700'
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className={`rounded-[1.6rem] border p-5 ${
              mode === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-[#f7fafe]'
            }`}
          >
            <p className={`text-[11px] font-black uppercase tracking-[0.16em] ${mode === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Why It Feels Modern</p>
            <p className={`mt-4 text-sm leading-7 ${mode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              카드 모양만 최신스럽게 만드는 게 아니라, 좌우 비율과 정보층이 한눈에 “제품”처럼 읽히게 만드는 게 핵심입니다.
            </p>
          </div>
        </div>
      </PreviewFrame>

      <PreviewFrame mode={mode} eyebrow="Dark Mode" title="다크모드에서 더 살아나는 타입">
        <div className="grid gap-4">
          <div className="rounded-[1.6rem] bg-[#0b1220] p-5 text-white">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#77c3ff]">Dark Surfaces</p>
            <p className="mt-3 text-lg font-black">밝은 테두리와 포인트 블루가 더 또렷하게 보입니다.</p>
          </div>
          <SemesterSpine mode={mode} />
        </div>
      </PreviewFrame>
    </div>
  );
}

function StudioPreview({ mode }: { mode: ThemeMode }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <PreviewFrame mode={mode} eyebrow="Hero" title="우리 사이트라는 인상을 크게">
        <div
          className={`rounded-[1.7rem] border p-6 ${
            mode === 'dark'
              ? 'border-white/10 bg-[linear-gradient(135deg,#0a6ad6_0%,#07101d_100%)]'
              : 'border-slate-200 bg-[linear-gradient(135deg,#0a6ad6_0%,#dfeeff_100%)]'
          }`}
        >
          <h4 className={`max-w-lg text-4xl font-black leading-[1.02] ${mode === 'dark' ? 'text-white' : 'text-slate-950'}`}>
            이건 인하대 강의평 사이트다.
            <br />
            한 번에 느껴지게.
          </h4>
          <p className={`mt-4 max-w-xl text-sm leading-7 ${mode === 'dark' ? 'text-white/78' : 'text-slate-700'}`}>
            개성은 강하지만, 실제 서비스 전체에는 섞어서 써야 완성도가 높아집니다.
          </p>
        </div>
      </PreviewFrame>

      <PreviewFrame mode={mode} eyebrow="Signature Hook" title="한 포인트를 확실하게">
        <SemesterSpine mode={mode} />
      </PreviewFrame>
    </div>
  );
}

function ActivePreview({ conceptId, mode }: { conceptId: ConceptId; mode: ThemeMode }) {
  if (conceptId === 'editorial') {
    return <EditorialPreview mode={mode} />;
  }

  if (conceptId === 'system') {
    return <ProductPreview mode={mode} />;
  }

  if (conceptId === 'studio') {
    return <StudioPreview mode={mode} />;
  }

  return <HybridPreview mode={mode} />;
}

export function DesignPreviewPage() {
  const [activeConcept, setActiveConcept] = useState<ConceptId>('hybrid');
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

  const active = concepts.find((item) => item.id === activeConcept) ?? concepts[0];
  const isDark = themeMode === 'dark';

  return (
    <div
      className={`min-h-screen px-4 py-10 transition-colors ${
        isDark
          ? 'bg-[radial-gradient(circle_at_top,rgba(10,106,214,0.18),transparent_28%),linear-gradient(180deg,#07111d_0%,#0b1422_100%)]'
          : 'bg-[radial-gradient(circle_at_top,rgba(10,106,214,0.10),transparent_30%),linear-gradient(180deg,#eef3f8_0%,#f8fbfe_100%)]'
      }`}
    >
      <div className="mx-auto max-w-[1450px] space-y-8">
        <section
          className={`overflow-hidden rounded-[2.6rem] border ${
            isDark
              ? 'border-white/10 bg-[#08121e]/90 shadow-[0_30px_80px_rgba(0,0,0,0.35)]'
              : 'border-slate-200 bg-white/92 shadow-[0_26px_70px_rgba(15,23,42,0.08)]'
          }`}
        >
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.12fr_0.88fr] lg:px-8 lg:py-9">
            <div>
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.22em] ${
                  isDark ? 'border-white/10 bg-white/[0.03] text-[#77c3ff]' : 'border-slate-200 bg-[#f7fafe] text-[#0a6ad6]'
                }`}
              >
                <SwatchBook className="h-3.5 w-3.5" />
                Design Direction Lab
              </div>
              <h1 className={`mt-5 max-w-4xl text-4xl font-black tracking-tight md:text-[3.55rem] md:leading-[1.03] ${isDark ? 'text-white' : 'text-slate-950'}`}>
                색만 바꾸는 게 아니라,
                <br />
                인하평의 존재감이 보이는 구조로 다시
              </h1>
              <p className={`mt-5 max-w-3xl text-base leading-8 md:text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                다크모드까지 고려한 대비 체계, 최신 제품 사이트처럼 밀도 있는 블록 배치, 그리고 인하평만의 시그니처 한 포인트를 함께 잡는 방향으로 시안을 다시 정리했습니다.
              </p>
            </div>

            <div className="grid gap-4">
              <div
                className={`rounded-[1.8rem] border p-5 ${
                  isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-[#f7fafe]'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-[11px] font-black uppercase tracking-[0.18em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Theme Mode</p>
                    <p className={`mt-2 text-lg font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>라이트와 다크 둘 다 먼저 설계</p>
                  </div>
                  <div
                    className={`inline-flex rounded-full border p-1 ${
                      isDark ? 'border-white/10 bg-[#0e1927]' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setThemeMode('light')}
                      className={`rounded-full px-3 py-2 text-sm font-bold transition ${
                        themeMode === 'light'
                          ? 'bg-[#0a6ad6] text-white'
                          : isDark
                            ? 'text-slate-400'
                            : 'text-slate-600'
                      }`}
                    >
                      <SunMedium className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setThemeMode('dark')}
                      className={`rounded-full px-3 py-2 text-sm font-bold transition ${
                        themeMode === 'dark'
                          ? 'bg-[#0a6ad6] text-white'
                          : isDark
                            ? 'text-slate-400'
                            : 'text-slate-600'
                      }`}
                    >
                      <MoonStar className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ['Signature', 'Semester Spine'],
                  ['Layout', 'Asymmetric'],
                  ['Palette', 'Neutral + Blue'],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className={`rounded-[1.5rem] border p-4 ${
                      isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <p className={`text-[11px] font-black uppercase tracking-[0.16em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
                    <p className={`mt-2 text-xl font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            {concepts.map((concept) => {
              const activeState = concept.id === activeConcept;

              return (
                <button
                  key={concept.id}
                  type="button"
                  onClick={() => setActiveConcept(concept.id)}
                  className={`w-full rounded-[1.8rem] border p-5 text-left transition ${
                    activeState
                      ? isDark
                        ? 'border-[#0a6ad6]/50 bg-[#0e1927] shadow-[0_18px_36px_rgba(10,106,214,0.16)]'
                        : 'border-[#0a6ad6]/20 bg-[#f4f8fc] shadow-[0_18px_36px_rgba(10,106,214,0.08)]'
                      : isDark
                        ? 'border-white/10 bg-white/[0.03] hover:border-white/16'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0a6ad6]">{concept.eyebrow}</p>
                      <h2 className={`mt-2 text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>{concept.label}</h2>
                      <p className={`mt-2 text-sm leading-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{concept.summary}</p>
                    </div>
                    <ChevronRight className={`mt-1 h-5 w-5 shrink-0 ${activeState ? 'text-[#0a6ad6]' : isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                  </div>
                </button>
              );
            })}
          </div>

          <section
            className={`rounded-[2.3rem] border p-5 ${
              isDark ? 'border-white/10 bg-[#08121e]/90' : 'border-slate-200 bg-white/92'
            }`}
          >
            <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
              <div
                className={`rounded-[1.8rem] border p-5 ${
                  isDark ? 'border-white/10 bg-[#0e1927]' : 'border-slate-200 bg-[#f4f8fc]'
                }`}
              >
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0a6ad6]">{active.eyebrow}</p>
                <h2 className={`mt-3 text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>{active.title}</h2>
                <p className={`mt-3 text-sm leading-7 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{active.why}</p>
                <div
                  className={`mt-4 rounded-[1.3rem] border px-4 py-3 ${
                    isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white'
                  }`}
                >
                  <p className={`text-[11px] font-black uppercase tracking-[0.16em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Tone</p>
                  <p className={`mt-2 text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{active.tone}</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div
                  className={`rounded-[1.8rem] border p-5 ${
                    isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white'
                  }`}
                >
                  <p className={`text-[11px] font-black uppercase tracking-[0.16em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Fit</p>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>브랜드 정체성</span>
                      <ScoreBar value={active.fit.identity} mode={themeMode} />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>제품 구조</span>
                      <ScoreBar value={active.fit.product} mode={themeMode} />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>다크모드 적합성</span>
                      <ScoreBar value={active.fit.darkMode} mode={themeMode} />
                    </div>
                  </div>
                </div>

                <div
                  className={`rounded-[1.8rem] border p-5 ${
                    isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white'
                  }`}
                >
                  <p className={`text-[11px] font-black uppercase tracking-[0.16em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Core Hook</p>
                  <p className={`mt-3 text-lg font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>Semester Spine 하나로 우리다움 확보</p>
                  <p className={`mt-2 text-sm leading-7 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    “같은 강의를 학기별로 이어본다”는 구조를 히어로, 상세, 검색 카드까지 반복 노출하면 브랜드 기억점이 생깁니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <ActivePreview conceptId={activeConcept} mode={themeMode} />
            </div>
          </section>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <div
            className={`rounded-[2.2rem] border p-6 ${
              isDark ? 'border-white/10 bg-[#08121e]/90' : 'border-slate-200 bg-white/92'
            }`}
          >
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0a6ad6]">What Should Actually Change</p>
            <h2 className={`mt-3 text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>실제 사이트에서 바뀌어야 하는 포인트</h2>
            <div className="mt-5 grid gap-3">
              {[
                {
                  icon: LayoutGrid,
                  title: '블록 배치를 더 과감하게',
                  body: '지금은 카드가 비슷한 크기로 줄지어 있어 템플릿 느낌이 납니다. 메인 화면부터 비대칭 배치로 리듬을 만들어야 합니다.',
                },
                {
                  icon: ChartNoAxesColumn,
                  title: '검색과 상세의 표면을 분리',
                  body: '검색은 빠른 판단용, 상세는 읽는 경험용으로 표면과 간격 체계를 달리 가져가야 훨씬 성숙해 보입니다.',
                },
                {
                  icon: Sparkles,
                  title: '색보다 구조가 먼저 브랜드가 되게',
                  body: '인하 블루를 많이 쓰는 것보다, Semester Spine 같은 고유 구조를 반복 노출하는 게 더 강한 브랜딩이 됩니다.',
                },
              ].map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className={`rounded-[1.5rem] border p-4 ${
                    isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-[#f7fafe]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-2xl p-3 ${isDark ? 'bg-[#0f1b2b] text-[#77c3ff]' : 'bg-white text-[#0a6ad6]'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>{title}</p>
                      <p className={`mt-1 text-sm leading-7 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2.2rem] bg-[#0a6ad6] p-6 text-white shadow-[0_24px_60px_rgba(10,106,214,0.26)]">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/72">My Recommendation</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">한 포인트만 콕 집자면</h2>
            <p className="mt-4 text-xl font-black leading-snug">
              “같은 강의를 학기별로 이어보는 Semester Spine”
            </p>
            <p className="mt-4 text-sm leading-7 text-white/88">
              이 서비스는 단순 강의평 모음보다, 시간에 따라 강의가 어떻게 달라졌는지를 읽는 아카이브처럼 보일 때 훨씬 특별해집니다. 이 포인트 하나만 제대로 밀어도 우리만의 사이트라는 게 확 들어옵니다.
            </p>
            <div className="mt-6 rounded-[1.6rem] border border-white/14 bg-[#0b5fc0] p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/70">Apply To</p>
              <div className="mt-3 space-y-2 text-sm font-semibold text-white/90">
                <div>홈: 이번 학기 vs 지난 학기 비교 진입점</div>
                <div>검색: 카드 옆 작은 학기 스파인</div>
                <div>상세: 메인 히어로 아래 전체 타임라인</div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm font-black">
              이 방향으로 실제 홈부터 바꾸기 좋음
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
