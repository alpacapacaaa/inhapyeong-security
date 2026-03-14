import { ArrowRight, BookOpen, Search, Star } from 'lucide-react';

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-[#005bac]/10 bg-white p-6 shadow-[0_12px_32px_rgba(0,91,172,0.05)]">
      <div className="mb-5">
        <p className="text-sm font-black text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="overflow-hidden rounded-[1.75rem] border border-[#005bac]/10">
        {children}
      </div>
    </section>
  );
}

function PreviewCourseCard({
  accent,
  bg,
  label,
}: {
  accent: string;
  bg: string;
  label: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-black/5 bg-white p-5 shadow-[0_8px_24px_rgba(15,35,64,0.05)]">
      <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: accent }}>
        {label}
      </p>
      <h4 className="mt-2 text-xl font-black tracking-tight text-slate-900">자료구조</h4>
      <p className="mt-1 text-sm text-slate-500">최동욱 교수님 · 컴퓨터공학과</p>
      <div className="mt-4 rounded-2xl border border-black/5 px-4 py-3" style={{ backgroundColor: bg }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Review Score</p>
            <p className="mt-1 text-2xl font-black text-slate-900">4.3</p>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className="h-4 w-4 fill-current text-current" style={{ color: accent }} />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
        과제가 많지만 배우는 게 많고, 학기별 리뷰를 비교하면 교수님 운영 스타일 차이를 읽기 좋습니다.
      </p>
    </div>
  );
}

function OptionOne() {
  return (
    <div className="bg-[#f7fbff]">
      <div className="flex items-center justify-between border-b border-[#005bac]/10 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-1.5 rounded-full bg-[#005bac]" />
          <div className="leading-none">
            <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#0162b4]">Inha Review Archive</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-[#0f2340]">인하평</p>
          </div>
        </div>
        <div className="hidden rounded-full border border-[#005bac]/10 bg-white px-4 py-2 text-sm font-bold text-slate-700 md:block">
          강의 둘러보기
        </div>
      </div>

      <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div>
          <p className="text-[12px] font-black uppercase tracking-[0.22em] text-[#1084e8]">Option 1</p>
          <h3 className="mt-3 text-4xl font-black leading-tight tracking-tight text-slate-900">
            텍스트 중심 로고로
            <br />
            아카이브 성격을 강조한 방식
          </h3>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            로고를 거의 타이포그래피로 처리해서 브랜드가 더 안정적으로 보입니다. 정보 서비스 같고, 오래 가는 느낌이 강합니다.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <button className="rounded-full bg-gradient-to-r from-[#005bac] to-[#1084e8] px-5 py-3 text-sm font-black text-white">
              검색하기
            </button>
            <button className="rounded-full border border-[#005bac]/10 bg-white px-5 py-3 text-sm font-bold text-slate-700">
              최신 강의 보기
            </button>
          </div>
        </div>
        <PreviewCourseCard accent="#005bac" bg="#eef8ff" label="Editorial" />
      </div>
    </div>
  );
}

function OptionTwo() {
  return (
    <div className="bg-[#f4fbff]">
      <div className="flex items-center justify-between border-b border-[#1084e8]/12 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#005bac] to-[#1084e8] text-white shadow-[0_12px_28px_rgba(16,132,232,0.24)]">
            <span className="text-3xl font-black tracking-tight">IH</span>
          </div>
          <div className="leading-none">
            <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#0162b4]">Inha Review Archive</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-[#0f2340]">인하평</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-[#1084e8]/12 bg-white px-4 py-2 md:flex">
          <span className="inline-flex h-2 w-2 rounded-full bg-[#11ebff] shadow-[0_0_10px_rgba(17,235,255,0.7)]" />
          <span className="text-sm font-black text-[#005bac]">수강신청 시즌</span>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.75rem] bg-gradient-to-br from-[#005bac] via-[#0162b4] to-[#1084e8] p-8 text-white">
          <p className="text-[12px] font-black uppercase tracking-[0.22em] text-[#d9fbff]">Option 2</p>
          <h3 className="mt-3 text-4xl font-black leading-tight tracking-tight">
            이니셜 배지로
            <br />
            브랜드 심볼을 강하게 남기는 방식
          </h3>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/85">
            앱 아이콘이나 썸네일로 확장하기 좋고, 학교 블루를 가장 브랜드답게 사용할 수 있는 방향입니다.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <button className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#005bac]">
              강의평 보러가기
            </button>
            <button className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white/90">
              학기별 리뷰 보기
            </button>
          </div>
        </div>
        <PreviewCourseCard accent="#1084e8" bg="#f1f9ff" label="Identity" />
      </div>
    </div>
  );
}

function OptionThree() {
  return (
    <div className="bg-[#f7fdff]">
      <div className="flex items-center justify-between border-b border-[#04a1e2]/12 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#1084e8]/12 bg-white">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#11ebff]/25 to-transparent" />
            <div className="relative h-8 w-8 rounded-full border-[5px] border-[#005bac]" />
          </div>
          <div className="leading-none">
            <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#0162b4]">Inha Review Archive</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-[#0f2340]">인하평</p>
          </div>
        </div>
        <button className="hidden rounded-full border border-[#04a1e2]/12 bg-white px-4 py-2 text-sm font-bold text-slate-700 md:block">
          전체 강의
        </button>
      </div>

      <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-[12px] font-black uppercase tracking-[0.22em] text-[#04a1e2]">Option 3</p>
          <h3 className="mt-3 text-4xl font-black leading-tight tracking-tight text-slate-900">
            심볼은 최소화하고
            <br />
            화면 전체의 질감으로 승부하는 방식
          </h3>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            미니멀하고 차분하지만, 로고 자체의 인상은 가장 약합니다. 대신 페이지 전체를 같이 다듬으면 완성도가 높게 나옵니다.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <button className="rounded-full border border-[#005bac]/10 bg-white px-5 py-3 text-sm font-black text-[#005bac]">
              탐색 시작
            </button>
            <button className="rounded-full border border-[#04a1e2]/12 bg-[#ecfbff] px-5 py-3 text-sm font-bold text-[#047fb2]">
              시안 느낌 보기
            </button>
          </div>
        </div>
        <PreviewCourseCard accent="#04a1e2" bg="#ecfbff" label="Minimal" />
      </div>
    </div>
  );
}

export function LogoPreviewPage() {
  return (
    <div className="min-h-screen bg-transparent px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2.5rem] border border-[#005bac]/10 bg-white p-8 shadow-[0_18px_48px_rgba(0,91,172,0.06)]">
          <p className="text-[12px] font-black uppercase tracking-[0.26em] text-[#1084e8]">Brand System Preview</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">로고만이 아니라 페이지와 함께 보는 시안 비교</h1>
          <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
            로고만 바꾸면 어색해질 수 있어서, 헤더와 첫 화면 카드까지 함께 보이도록 세 가지 방향을 준비했습니다.
            어느 시안이 인하평의 정보 서비스 성격과 가장 잘 맞는지 비교해보세요.
          </p>
        </div>

        <div className="grid gap-6">
          <SectionCard
            title="시안 1. 텍스트 중심 아카이브형"
            description="가장 차분하고 세련된 방향. 브랜드보다 정보 구조를 먼저 읽게 합니다."
          >
            <OptionOne />
          </SectionCard>

          <SectionCard
            title="시안 2. 이니셜 브랜드형"
            description="학교 블루를 가장 강하게 살리면서도 앱/서비스 브랜드처럼 보이게 하는 방향."
          >
            <OptionTwo />
          </SectionCard>

          <SectionCard
            title="시안 3. 미니멀 심볼형"
            description="로고는 최소화하고 전체 페이지의 레이아웃과 여백으로 분위기를 만드는 방향."
          >
            <OptionThree />
          </SectionCard>
        </div>

        <div className="mt-8 rounded-[2rem] border border-[#005bac]/10 bg-white p-6 shadow-[0_12px_32px_rgba(0,91,172,0.05)]">
          <p className="text-sm font-black text-slate-900">추천</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            인하평처럼 리뷰와 비교가 중요한 서비스라면 저는 <strong>시안 1</strong> 또는 <strong>시안 2</strong>를 추천해요.
            시안 1은 가장 세련되고 오래 가는 느낌이고, 시안 2는 브랜드 기억도가 더 좋습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
