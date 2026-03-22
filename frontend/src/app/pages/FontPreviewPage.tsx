type FontOption = {
  id: string;
  label: string;
  titleFont: string;
  bodyFont: string;
  titleWeight: number;
  cardTone: string;
  accent: string;
  panel: string;
  summary: string;
  bestFor: string;
  recommendation?: string;
};

const fontOptions: FontOption[] = [
  {
    id: 'wanted-suit',
    label: 'Option A',
    titleFont: '"Wanted Sans Variable", "Wanted Sans", sans-serif',
    bodyFont: '"SUIT", "Pretendard Variable", sans-serif',
    titleWeight: 820,
    cardTone: 'from-[#eef6ff] via-white to-[#f7fbff]',
    accent: '#005bac',
    panel: '#eff6ff',
    summary: '가장 서비스답고 또렷합니다. 큰 제목이 덜 밋밋하고, 본문은 안정적으로 읽힙니다.',
    bestFor: '홈, 검색, 강의 상세, 마이페이지 전체',
    recommendation: '현재 인하평에 가장 추천',
  },
  {
    id: 'suit-only',
    label: 'Option B',
    titleFont: '"SUIT", "Pretendard Variable", sans-serif',
    bodyFont: '"SUIT", "Pretendard Variable", sans-serif',
    titleWeight: 800,
    cardTone: 'from-[#f5f8fb] via-white to-[#f7fafc]',
    accent: '#1d4e89',
    panel: '#f3f7fb',
    summary: '전체 화면 톤이 가장 단정합니다. 무난하지만 오래 봐도 질리지 않는 타입입니다.',
    bestFor: '전체 통일감, 관리 페이지, 폼 많은 화면',
  },
  {
    id: 'paperlogy-suit',
    label: 'Option C',
    titleFont: '"Paperlogy", "Wanted Sans Variable", sans-serif',
    bodyFont: '"SUIT", "Pretendard Variable", sans-serif',
    titleWeight: 700,
    cardTone: 'from-[#fdf7ef] via-white to-[#fffaf3]',
    accent: '#ba6b18',
    panel: '#fff3df',
    summary: '메인 첫인상은 가장 강합니다. 다만 서비스 전체에 쓰기보다는 대표 타이틀에 잘 맞습니다.',
    bestFor: '메인 히어로, 홍보 페이지, 브랜드 타이틀',
  },
];

function StatPill({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-full border border-[rgba(15,23,42,0.08)] bg-white px-4 py-2 text-sm">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="ml-2 font-black" style={{ color: accent }}>
        {value}
      </span>
    </div>
  );
}

function FontOptionPreview({ option }: { option: FontOption }) {
  return (
    <section className="page-panel overflow-hidden">
      <div className={`bg-gradient-to-br ${option.cardTone} border-b border-[rgba(15,23,42,0.06)] px-6 py-5`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.24em]" style={{ color: option.accent }}>
              {option.label}
            </p>
            <h2
              className="mt-3 text-[2.8rem] leading-[0.95] tracking-[-0.06em] text-slate-950 md:text-[4rem]"
              style={{ fontFamily: option.titleFont, fontWeight: option.titleWeight }}
            >
              인하평
            </h2>
            <p
              className="mt-3 max-w-xl text-base leading-7 text-slate-600 md:text-lg"
              style={{ fontFamily: option.bodyFont, fontWeight: 500 }}
            >
              강의 탐색부터 강의평 비교, 시간표 담기까지 한 번에.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatPill label="Title" value={option.titleFont.split(',')[0].replace(/"/g, '')} accent={option.accent} />
            <StatPill label="Body" value={option.bodyFont.split(',')[0].replace(/"/g, '')} accent={option.accent} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <div className="rounded-[1.6rem] border border-[rgba(15,23,42,0.08)] bg-white p-5">
            <p
              className="text-sm uppercase tracking-[0.18em]"
              style={{ fontFamily: option.bodyFont, fontWeight: 700, color: option.accent }}
            >
              Home Hero
            </p>
            <h3
              className="mt-3 text-[2rem] leading-[1.02] tracking-[-0.05em] text-slate-950 md:text-[2.6rem]"
              style={{ fontFamily: option.titleFont, fontWeight: option.titleWeight }}
            >
              수강신청 전에
              <br />
              강의평 먼저 확인해보세요
            </h3>
            <p
              className="mt-4 max-w-xl text-[15px] leading-7 text-slate-600"
              style={{ fontFamily: option.bodyFont, fontWeight: 500 }}
            >
              학기별 리뷰를 비교하고, 교수님별 분위기를 살펴보고, 시간표 장바구니까지 한 화면에서 이어집니다.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full px-5 py-3 text-sm text-white shadow-[0_12px_26px_rgba(15,23,42,0.14)]"
                style={{ backgroundColor: option.accent, fontFamily: option.bodyFont, fontWeight: 700 }}
              >
                강의 검색하기
              </button>
              <button
                type="button"
                className="rounded-full border border-[rgba(15,23,42,0.08)] bg-white px-5 py-3 text-sm text-slate-700"
                style={{ fontFamily: option.bodyFont, fontWeight: 700 }}
              >
                최근 리뷰 보기
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-[1.5rem] border border-[rgba(15,23,42,0.08)] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
              <p
                className="text-[11px] uppercase tracking-[0.18em]"
                style={{ fontFamily: option.bodyFont, fontWeight: 800, color: option.accent }}
              >
                Course Card
              </p>
              <h4
                className="mt-3 text-[1.55rem] leading-tight text-slate-950"
                style={{ fontFamily: option.titleFont, fontWeight: option.titleWeight }}
              >
                자료구조
              </h4>
              <p className="mt-1 text-sm text-slate-500" style={{ fontFamily: option.bodyFont, fontWeight: 500 }}>
                최동욱 교수님 · 컴퓨터공학과
              </p>
              <div className="mt-4 rounded-[1.15rem] px-4 py-4" style={{ backgroundColor: option.panel }}>
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400" style={{ fontFamily: option.bodyFont, fontWeight: 700 }}>
                  Review Score
                </p>
                <p
                  className="mt-2 text-[2rem] leading-none text-slate-950"
                  style={{ fontFamily: option.titleFont, fontWeight: option.titleWeight }}
                >
                  4.3
                </p>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600" style={{ fontFamily: option.bodyFont, fontWeight: 500 }}>
                과제는 있는 편이지만 배워가는 게 많고, 시험 정보 리뷰가 꽤 자세하게 쌓여 있는 강의입니다.
              </p>
            </article>

            <article className="rounded-[1.5rem] border border-[rgba(15,23,42,0.08)] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
              <p
                className="text-[11px] uppercase tracking-[0.18em]"
                style={{ fontFamily: option.bodyFont, fontWeight: 800, color: option.accent }}
              >
                Search Filter
              </p>
              <div className="mt-4 rounded-[1.15rem] border border-[rgba(15,23,42,0.08)] bg-slate-50 px-4 py-3">
                <p className="text-sm text-slate-400" style={{ fontFamily: option.bodyFont, fontWeight: 500 }}>
                  강의명, 교수님, 학과로 검색
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {['컴퓨터공학과', '이번 학기', '리뷰 많은 순'].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-[rgba(15,23,42,0.08)] bg-white px-3 py-2 text-xs text-slate-600"
                    style={{ fontFamily: option.bodyFont, fontWeight: 700 }}
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </article>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[1.6rem] border border-[rgba(15,23,42,0.08)] bg-white p-5">
            <p
              className="text-sm uppercase tracking-[0.18em]"
              style={{ fontFamily: option.bodyFont, fontWeight: 700, color: option.accent }}
            >
              My Page / Review Panel
            </p>
            <h3
              className="mt-3 text-[1.8rem] leading-tight text-slate-950"
              style={{ fontFamily: option.titleFont, fontWeight: option.titleWeight }}
            >
              내가 남긴 강의평
            </h3>
            <div className="mt-5 space-y-3">
              <div className="rounded-[1.25rem] border border-[rgba(15,23,42,0.08)] bg-slate-50 p-4">
                <p className="text-base text-slate-900" style={{ fontFamily: option.bodyFont, fontWeight: 700 }}>
                  운영체제
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600" style={{ fontFamily: option.bodyFont, fontWeight: 500 }}>
                  교수님 설명은 명확하고 시험은 예고 범위 안에서 나오는 편입니다.
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-[rgba(15,23,42,0.08)] bg-slate-50 p-4">
                <p className="text-base text-slate-900" style={{ fontFamily: option.bodyFont, fontWeight: 700 }}>
                  데이터베이스
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600" style={{ fontFamily: option.bodyFont, fontWeight: 500 }}>
                  시험보다 과제 비중이 크고, 족보보다는 실습 위주로 준비하는 게 좋았습니다.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-[rgba(15,23,42,0.08)] bg-white p-5">
            <p className="text-sm font-black text-slate-900" style={{ fontFamily: option.bodyFont }}>
              이 조합의 인상
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600" style={{ fontFamily: option.bodyFont, fontWeight: 500 }}>
              {option.summary}
            </p>
            <div className="mt-4 rounded-[1.25rem] px-4 py-4" style={{ backgroundColor: option.panel }}>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500" style={{ fontFamily: option.bodyFont, fontWeight: 800 }}>
                Best For
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700" style={{ fontFamily: option.bodyFont, fontWeight: 600 }}>
                {option.bestFor}
              </p>
            </div>

            {option.recommendation ? (
              <div
                className="mt-4 rounded-[1.15rem] px-4 py-3 text-sm text-white shadow-[0_12px_24px_rgba(15,23,42,0.12)]"
                style={{ backgroundColor: option.accent, fontFamily: option.bodyFont, fontWeight: 700 }}
              >
                {option.recommendation}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FontPreviewPage() {
  return (
    <div className="min-h-screen bg-transparent px-4 py-10">
      <div className="page-shell">
        <section className="page-panel mb-8 overflow-hidden">
          <div className="bg-[linear-gradient(135deg,rgba(0,91,172,0.10),rgba(255,255,255,0.96)_44%,rgba(15,23,42,0.04))] px-7 py-8 md:px-10 md:py-10">
            <p className="text-[12px] font-black uppercase tracking-[0.26em] text-[#005bac]">Font Preview Board</p>
            <h1 className="mt-4 text-[2.6rem] font-black tracking-[-0.06em] text-slate-950 md:text-[4rem]">
              인하평 폰트 시안 비교
            </h1>
            <p className="mt-4 max-w-4xl text-base leading-7 text-slate-600 md:text-lg">
              추천드린 세 가지 조합을 같은 화면 구성으로 실제 적용해 비교할 수 있게 만들었습니다.
              제목의 힘, 본문 가독성, 카드와 검색 화면에서의 인상을 한 번에 확인해보세요.
            </p>
          </div>
        </section>

        <div className="grid gap-6">
          {fontOptions.map((option) => (
            <FontOptionPreview key={option.id} option={option} />
          ))}
        </div>
      </div>
    </div>
  );
}
