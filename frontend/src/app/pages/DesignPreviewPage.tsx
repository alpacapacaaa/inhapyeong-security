import { useState } from 'react';
import {
  ChevronRight,
  Heart,
  LayoutGrid,
  Package,
  Receipt,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Tags,
} from 'lucide-react';

type VariantId = 'collection' | 'curation' | 'checkout';

type Variant = {
  id: VariantId;
  label: string;
  eyebrow: string;
  title: string;
  summary: string;
  highlights: string[];
  palette: {
    accent: string;
    soft: string;
    border: string;
    hero: string;
    chip: string;
  };
};

const variants: Variant[] = [
  {
    id: 'collection',
    label: 'Option A',
    eyebrow: 'Most Mall-like',
    title: 'Collection Wall',
    summary:
      '베스트 상품 모아보기처럼 담은 강의를 카드 월로 먼저 보여주고, 오른쪽에서 시간표 확정 패널을 붙이는 구조입니다.',
    highlights: ['카드 중심이라 요즘 쇼핑몰 감성이 강함', '시간표보다 선택 과정이 먼저 보임', '찜 목록/비교 화면처럼 읽힘'],
    palette: {
      accent: '#005bac',
      soft: '#edf5ff',
      border: '#d9e3ee',
      hero: 'linear-gradient(135deg,#f4f9ff 0%,#ffffff 100%)',
      chip: '#f6f9fd',
    },
  },
  {
    id: 'curation',
    label: 'Option B',
    eyebrow: 'Most Trendy',
    title: 'Curation Market',
    summary:
      '기획전 페이지처럼 추천 조합, 빠른 필터, 장바구니 요약을 위에서부터 흐르게 두는 구조입니다.',
    highlights: ['배너와 큐레이션 섹션이 살아남', '추천 조합을 강조하기 좋음', '메인과 시간표가 한 서비스처럼 이어짐'],
    palette: {
      accent: '#1a4e9d',
      soft: '#f3efe8',
      border: '#e4ddd3',
      hero: 'linear-gradient(135deg,#fbf8f3 0%,#ffffff 100%)',
      chip: '#fbf7f1',
    },
  },
  {
    id: 'checkout',
    label: 'Option C',
    eyebrow: 'Most Practical',
    title: 'Wishlist Checkout',
    summary:
      '찜 목록과 최종 결제 화면 사이 어딘가 같은 구조로, 왼쪽엔 고민 중인 강의, 오른쪽엔 확정 내역과 시간표를 두는 방식입니다.',
    highlights: ['실사용 도구로서 가장 안정적임', '시간표와 장바구니의 역할이 명확함', '실제 적용이 쉬움'],
    palette: {
      accent: '#2d7e4f',
      soft: '#eef8f0',
      border: '#dce7de',
      hero: 'linear-gradient(135deg,#f6fcf7 0%,#ffffff 100%)',
      chip: '#f6fbf7',
    },
  },
];

const courseCards = [
  { title: '알고리즘설계', professor: '홍길동 교수님', rating: '4.7', badge: '전공필수', slots: '월 2-3 · 수 2-3' },
  { title: '모바일프로그래밍', professor: '윤지훈 교수님', rating: '4.4', badge: '전공선택', slots: '목 5-7' },
  { title: '소프트웨어공학', professor: '한주희 교수님', rating: '4.6', badge: '전공선택', slots: '화 10-12' },
  { title: '데이터베이스', professor: '김데이터 교수님', rating: '4.5', badge: '전공필수', slots: '화 9-10 · 목 9-10' },
];

const placedSummary = [
  '객체지향프로그래밍 1',
  '운영체제',
  '역사와 문화의 대화',
  '웹프로그래밍',
];

function PreviewHeader({ active }: { active: Variant }) {
  return (
    <section
      className="rounded-[2rem] border p-7 shadow-[0_24px_70px_rgba(15,23,42,0.06)]"
      style={{
        background: active.palette.hero,
        borderColor: active.palette.border,
      }}
    >
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="text-[11px] font-black uppercase tracking-[0.24em]" style={{ color: active.palette.accent }}>
            Timetable Commerce
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">시간표를 쇼핑몰 구조로 갈아엎는 시안</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            보드 안의 블록을 예쁘게 만드는 대신, 시간표 페이지 전체를 요즘 쇼핑몰처럼 보이게 재구성한 비교 보드입니다.
            핵심은 `찜`, `비교`, `담기`, `확정` 흐름을 더 분명하게 만드는 거예요.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[1.25rem] border bg-white/90 px-4 py-4" style={{ borderColor: active.palette.border }}>
            <Heart className="h-4 w-4" style={{ color: active.palette.accent }} />
            <p className="mt-2 text-sm font-black text-slate-950">찜/비교 중심</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">시간표보다 먼저 선택 경험을 강조</p>
          </div>
          <div className="rounded-[1.25rem] border bg-white/90 px-4 py-4" style={{ borderColor: active.palette.border }}>
            <ShoppingBag className="h-4 w-4" style={{ color: active.palette.accent }} />
            <p className="mt-2 text-sm font-black text-slate-950">장바구니 흐름</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">담아둔 강의와 확정 강의를 분리</p>
          </div>
          <div className="rounded-[1.25rem] border bg-white/90 px-4 py-4" style={{ borderColor: active.palette.border }}>
            <Receipt className="h-4 w-4" style={{ color: active.palette.accent }} />
            <p className="mt-2 text-sm font-black text-slate-950">최종 확정 패널</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">결제 직전 페이지처럼 요약</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchStrip({ active }: { active: Variant }) {
  return (
    <div className="rounded-[1.6rem] border bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.04)]" style={{ borderColor: active.palette.border }}>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3 rounded-full border px-5 py-4" style={{ borderColor: active.palette.border, backgroundColor: '#ffffff' }}>
          <Search className="h-5 w-5 text-slate-400" />
          <span className="text-sm font-semibold text-slate-400">강의명, 교수님, 학과로 찾아보세요</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {['컴퓨터공학과', '이번 학기 개설', '리뷰 많은 순', '오전 강의 제외'].map((chip) => (
            <span
              key={chip}
              className="rounded-full border px-3 py-1.5 text-sm font-semibold text-slate-600"
              style={{ borderColor: active.palette.border, backgroundColor: active.palette.chip }}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ active, card }: { active: Variant; card: (typeof courseCards)[number] }) {
  return (
    <article className="rounded-[1.35rem] border bg-white p-4 shadow-sm" style={{ borderColor: active.palette.border }}>
      <div className="rounded-[1rem] border p-4" style={{ borderColor: active.palette.border, background: active.palette.hero }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <span
              className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-black"
              style={{ backgroundColor: active.palette.soft, color: active.palette.accent }}
            >
              {card.badge}
            </span>
            <p className="mt-3 text-xl font-black tracking-tight text-slate-950">{card.title}</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">{card.professor}</p>
          </div>
          <div className="rounded-full px-3 py-2 text-sm font-black" style={{ backgroundColor: '#fff', color: active.palette.accent }}>
            {card.rating}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1 text-amber-500">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className="h-4 w-4 fill-current" />
        ))}
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-500">{card.slots}</p>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <Tags className="h-3.5 w-3.5" />
          리뷰 24 · 관심 89
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black"
          style={{ backgroundColor: active.palette.soft, color: active.palette.accent }}
        >
          담아두기
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

function MiniTimetable({ active }: { active: Variant }) {
  const blocks = [
    { day: '월', top: 0, span: 2, label: '객체지향프로그래밍 1', color: '#ef7277', border: '#ab565c', text: '#fff' },
    { day: '화', top: 2, span: 2, label: '운영체제', color: '#f7a147', border: '#ba732d', text: '#fff' },
    { day: '수', top: 0, span: 2, label: '객체지향프로그래밍 1', color: '#ef7277', border: '#ab565c', text: '#fff' },
    { day: '금', top: 1, span: 3, label: '역사와 문화의 대화', color: '#4f95e8', border: '#336eb3', text: '#fff' },
  ];
  const days = ['월', '화', '수', '목', '금'];
  const rowHeight = 30;
  const rows = 6;

  return (
    <div className="rounded-[1.3rem] border bg-white p-4" style={{ borderColor: active.palette.border }}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em]" style={{ color: active.palette.accent }}>
            Confirmed Board
          </p>
          <h3 className="mt-1 text-lg font-black text-slate-950">시간표 미리보기</h3>
        </div>
        <span className="rounded-full px-3 py-1 text-xs font-black" style={{ backgroundColor: active.palette.soft, color: active.palette.accent }}>
          18학점
        </span>
      </div>

      <div className="grid grid-cols-[52px_repeat(5,1fr)]">
        <div />
        {days.map((day) => (
          <div key={day} className="flex h-9 items-center justify-center border text-sm font-black text-slate-700" style={{ borderColor: active.palette.border }}>
            {day}
          </div>
        ))}

        <div className="relative" style={{ height: rows * rowHeight }}>
          {Array.from({ length: rows }).map((_, index) => (
            <div
              key={index}
              className="absolute left-0 right-0 flex items-center justify-center border bg-[#fafcff] text-[11px] font-mono font-bold text-slate-500"
              style={{ top: index * rowHeight, height: rowHeight, borderColor: active.palette.border }}
            >
              {String(index + 9).padStart(2, '0')}
            </div>
          ))}
        </div>

        {days.map((day) => (
          <div key={day} className="relative border bg-white" style={{ height: rows * rowHeight, borderColor: active.palette.border }}>
            {Array.from({ length: rows }).map((_, row) => (
              <div
                key={`${day}-${row}`}
                className="absolute left-0 right-0 border-b"
                style={{ top: row * rowHeight, height: rowHeight, borderColor: '#ebf0f6' }}
              />
            ))}
            {blocks
              .filter((block) => block.day === day)
              .map((block) => (
                <div
                  key={`${block.day}-${block.label}`}
                  className="absolute left-0 right-0 overflow-hidden border-[2px] px-2 py-1"
                  style={{
                    top: block.top * rowHeight,
                    height: block.span * rowHeight,
                    backgroundColor: block.color,
                    borderColor: block.border,
                    color: block.text,
                  }}
                >
                  <p className="line-clamp-2 text-[10px] font-black leading-[1.05]">{block.label}</p>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CollectionWall({ active }: { active: Variant }) {
  return (
    <div className="space-y-5">
      <SearchStrip active={active} />
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {courseCards.map((card) => (
              <ProductCard key={card.title} active={active} card={card} />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-[1.4rem] border bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)]" style={{ borderColor: active.palette.border }}>
            <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: active.palette.accent }}>
              Cart Summary
            </p>
            <h3 className="mt-2 text-2xl font-black text-slate-950">시간표 장바구니</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ['찜한 강의', '12'],
                ['확정 강의', '6'],
                ['예상 학점', '18'],
                ['시간 충돌', '0'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1rem] border bg-[#fcfdff] px-3 py-3" style={{ borderColor: active.palette.border }}>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
                  <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <MiniTimetable active={active} />
        </div>
      </div>
    </div>
  );
}

function CurationMarket({ active }: { active: Variant }) {
  return (
    <div className="space-y-5">
      <section className="rounded-[1.7rem] border p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]" style={{ borderColor: active.palette.border, background: active.palette.hero }}>
        <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: active.palette.accent }}>
          Timetable Curation
        </p>
        <div className="mt-3 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-950">겹치지 않는 조합으로 이번 학기 시간표를 골라보세요.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">기획전 배너처럼 추천 조합을 먼저 보여주고, 아래에서 실제 강의를 비교하는 흐름입니다.</p>
          </div>
          <div className="grid gap-3">
            {[
              ['전공 몰입형 조합', '알고리즘설계 + 운영체제 + 데이터베이스'],
              ['교양 밸런스형 조합', '인문학적 사고와 글쓰기 + 역사와 문화의 대화'],
            ].map(([title, body]) => (
              <div key={title} className="rounded-[1.2rem] border bg-white/90 p-4" style={{ borderColor: active.palette.border }}>
                <p className="text-sm font-black text-slate-950">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[260px_1fr]">
        <aside className="rounded-[1.5rem] border bg-white p-4 shadow-sm" style={{ borderColor: active.palette.border }}>
          <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: active.palette.accent }}>
            Quick Filter
          </p>
          <div className="mt-4 space-y-3">
            {['오전 비우기', '금요일 최소화', '전공 우선', '리뷰 4.5 이상'].map((item) => (
              <div key={item} className="rounded-[1rem] border px-4 py-3 text-sm font-black text-slate-700" style={{ borderColor: active.palette.border, backgroundColor: active.palette.chip }}>
                {item}
              </div>
            ))}
          </div>
        </aside>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {courseCards.map((card) => (
              <ProductCard key={card.title} active={active} card={card} />
            ))}
          </div>
          <MiniTimetable active={active} />
        </div>
      </div>
    </div>
  );
}

function WishlistCheckout({ active }: { active: Variant }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-4">
        <div className="rounded-[1.5rem] border bg-white p-5 shadow-sm" style={{ borderColor: active.palette.border }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: active.palette.accent }}>
                Wishlist
              </p>
              <h3 className="mt-1 text-2xl font-black text-slate-950">고민 중인 강의</h3>
            </div>
            <Package className="h-5 w-5" style={{ color: active.palette.accent }} />
          </div>
          <div className="mt-4 space-y-3">
            {courseCards.map((card) => (
              <div key={card.title} className="rounded-[1.15rem] border bg-[#fcfdff] p-4" style={{ borderColor: active.palette.border }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-black text-slate-950">{card.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{card.professor}</p>
                  </div>
                  <span className="rounded-full px-3 py-1 text-xs font-black" style={{ backgroundColor: active.palette.soft, color: active.palette.accent }}>
                    {card.rating}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-slate-500">{card.slots}</span>
                  <button type="button" className="rounded-full px-3 py-1.5 text-xs font-black" style={{ backgroundColor: active.palette.soft, color: active.palette.accent }}>
                    담기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[1.5rem] border bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]" style={{ borderColor: active.palette.border }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: active.palette.accent }}>
                Checkout
              </p>
              <h3 className="mt-1 text-2xl font-black text-slate-950">이번 학기 시간표 확정</h3>
            </div>
            <Sparkles className="h-5 w-5" style={{ color: active.palette.accent }} />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              ['확정 강의', '6'],
              ['예상 학점', '18'],
              ['공강 만족도', '높음'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[1rem] border bg-[#fcfdff] px-4 py-3" style={{ borderColor: active.palette.border }}>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
                <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <MiniTimetable active={active} />

        <div className="rounded-[1.5rem] border bg-white p-5 shadow-sm" style={{ borderColor: active.palette.border }}>
          <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: active.palette.accent }}>
            Confirmed List
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {placedSummary.map((item) => (
              <div key={item} className="rounded-[1rem] border bg-[#fcfdff] px-4 py-3 text-sm font-black text-slate-700" style={{ borderColor: active.palette.border }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function VariantPreview({ active }: { active: Variant }) {
  if (active.id === 'collection') {
    return <CollectionWall active={active} />;
  }

  if (active.id === 'curation') {
    return <CurationMarket active={active} />;
  }

  return <WishlistCheckout active={active} />;
}

export function DesignPreviewPage() {
  const [selected, setSelected] = useState<VariantId>('collection');
  const active = variants.find((variant) => variant.id === selected) ?? variants[0];

  return (
    <div className="min-h-screen">
      <div className="page-shell py-8">
        <div className="mx-auto max-w-[1440px] space-y-6">
          <PreviewHeader active={active} />

          <section className="grid gap-4 xl:grid-cols-[330px_1fr]">
            <aside className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <div className="space-y-3">
                {variants.map((variant) => {
                  const isActive = variant.id === selected;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelected(variant.id)}
                      className="w-full rounded-[1.3rem] border px-4 py-4 text-left transition"
                      style={{
                        borderColor: isActive ? variant.palette.accent : '#e2e8f0',
                        backgroundColor: isActive ? variant.palette.soft : '#ffffff',
                        boxShadow: isActive ? '0 12px 24px rgba(15,23,42,0.06)' : 'none',
                      }}
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: isActive ? variant.palette.accent : '#94a3b8' }}>
                        {variant.eyebrow}
                      </p>
                      <h2 className="mt-2 text-lg font-black tracking-tight text-slate-950">{variant.label}</h2>
                      <p className="mt-1 text-sm font-bold text-slate-700">{variant.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{variant.summary}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-[1.4rem] border p-4" style={{ borderColor: active.palette.border, backgroundColor: active.palette.soft }}>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">What Feels Better</p>
                <div className="mt-3 space-y-2">
                  {active.highlights.map((item) => (
                    <div key={item} className="rounded-[0.95rem] bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <section className="rounded-[2rem] border border-slate-200 bg-[#fbfdff] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <VariantPreview active={active} />
            </section>
          </section>
        </div>
      </div>
    </div>
  );
}
