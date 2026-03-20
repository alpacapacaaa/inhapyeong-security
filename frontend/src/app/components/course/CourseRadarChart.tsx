import { useState } from 'react';
import { Activity } from 'lucide-react';

interface CourseRadarChartProps {
    data: number[];
    labels: string[];
}

export function CourseRadarChart({ data, labels }: CourseRadarChartProps) {
    const center = 120;
    const maxRadius = 84;
    const [hoveredStat, setHoveredStat] = useState<{
        label: string;
        value: number;
        x: number;
        y: number;
    } | null>(null);

    const getPoint = (value: number, angleIndex: number) => {
        const angle = (Math.PI / 3) * angleIndex - Math.PI / 2;
        const radius = (value / 5) * maxRadius;
        return `${center + radius * Math.cos(angle)},${center + radius * Math.sin(angle)}`;
    };

    const getCoordinates = (value: number, angleIndex: number) => {
        const angle = (Math.PI / 3) * angleIndex - Math.PI / 2;
        const radius = (value / 5) * maxRadius;
        return {
            x: center + radius * Math.cos(angle),
            y: center + radius * Math.sin(angle),
        };
    };

    const polygonPoints = data.map((value, index) => getPoint(value, index)).join(' ');
    const guides = [1, 2, 3, 4, 5].map(level => data.map((_, index) => getPoint(level, index)).join(' '));
    const averageScore = data.reduce((sum, value) => sum + value, 0) / Math.max(data.length, 1);

    return (
        <div className="flex w-full flex-1 flex-col justify-center py-1">
            <h3 className="mb-4 flex w-full items-center justify-center text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 md:justify-start">
                <Activity className="mr-2 h-3.5 w-3.5 text-[#6a67f5]" />
                육각형 스탯
            </h3>

            <div className="relative mx-auto w-full max-w-[392px] overflow-hidden rounded-[1.75rem] border border-[#e1e5ef] bg-[linear-gradient(180deg,#fdfefe_0%,#f8f9fd_100%)] px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_14px_28px_rgba(15,23,42,0.04)]">
                <div className="absolute inset-x-16 top-0 h-12 rounded-b-[1.1rem] bg-[linear-gradient(180deg,rgba(119,111,255,0.07),transparent)]" />

                {hoveredStat && (
                    <div
                        className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-xl border border-[rgba(15,23,42,0.08)] bg-white px-3 py-2 text-center shadow-[0_16px_30px_rgba(15,23,42,0.14)]"
                        style={{
                            left: `calc(${(hoveredStat.x / 240) * 100}% + 1rem)`,
                            top: `calc(${(hoveredStat.y / 240) * 100}% + 1.25rem)`,
                        }}
                    >
                        <p className="text-[11px] font-bold text-slate-400">{hoveredStat.label}</p>
                        <p className="mt-1 text-base font-black text-[#5f62dd]">{hoveredStat.value.toFixed(1)}</p>
                    </div>
                )}

                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6b6fd6]">Radar View</p>
                        <p className="mt-1 text-sm font-semibold text-slate-500">강의 성향을 한눈에 보는 요약</p>
                    </div>
                    <div className="rounded-[1rem] border border-[#e5e8f2] bg-white/88 px-3 py-2 text-right shadow-[0_4px_12px_rgba(15,23,42,0.03)]">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Overall</p>
                        <div className="mt-1 flex items-end justify-end gap-1.5">
                            <p className="text-xl font-black tracking-tight text-slate-950">{averageScore.toFixed(1)}</p>
                            <span className="pb-0.5 text-[11px] font-bold text-slate-400">/ 5.0</span>
                        </div>
                    </div>
                </div>

                <div className="relative aspect-square w-full overflow-hidden rounded-[1.45rem] border border-[#e7ebf3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,249,253,0.96))]">
                    <div className="absolute inset-7 rounded-full bg-[radial-gradient(circle,rgba(123,97,255,0.12),rgba(123,97,255,0.03)_42%,transparent_72%)]" />

                    <svg viewBox="0 0 240 240" className="relative z-10 h-full w-full overflow-visible">
                        <defs>
                            <linearGradient id="course-radar-fill" x1="0%" x2="100%" y1="0%" y2="100%">
                                <stop offset="0%" stopColor="#7a6fff" stopOpacity="0.18" />
                                <stop offset="100%" stopColor="#72a8ff" stopOpacity="0.06" />
                            </linearGradient>
                            <linearGradient id="course-radar-stroke" x1="0%" x2="100%" y1="0%" y2="100%">
                                <stop offset="0%" stopColor="#6f6de0" />
                                <stop offset="100%" stopColor="#68a0ef" />
                            </linearGradient>
                            <filter id="course-radar-glow" x="-40%" y="-40%" width="180%" height="180%">
                                <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#736cf0" floodOpacity="0.08" />
                            </filter>
                        </defs>

                        {guides.map((points, index) => (
                            <polygon
                                key={index}
                                points={points}
                                fill={index === guides.length - 1 ? 'rgba(255,255,255,0.35)' : 'none'}
                                stroke={index === guides.length - 1 ? '#dde3ef' : '#edf1f7'}
                                strokeWidth={index === guides.length - 1 ? '1.05' : '0.9'}
                            />
                        ))}

                        {data.map((_, index) => (
                            <line
                                key={index}
                                x1={center}
                                y1={center}
                                x2={center + maxRadius * Math.cos((Math.PI / 3) * index - Math.PI / 2)}
                                y2={center + maxRadius * Math.sin((Math.PI / 3) * index - Math.PI / 2)}
                                stroke="#e1e5f0"
                                strokeWidth="0.9"
                                strokeDasharray="2 4"
                            />
                        ))}

                        <polygon
                            points={polygonPoints}
                            fill="url(#course-radar-fill)"
                            filter="url(#course-radar-glow)"
                            stroke="url(#course-radar-stroke)"
                            strokeWidth="2.2"
                            strokeLinejoin="round"
                            className="transition-all duration-700 ease-out"
                        />

                        <circle cx={center} cy={center} r="15" fill="rgba(255,255,255,0.85)" stroke="#e6eaf3" strokeWidth="1" />
                        <text x={center} y={center + 4} textAnchor="middle" className="fill-[#6b6fd6] text-[11px] font-black">
                            {averageScore.toFixed(1)}
                        </text>

                        {data.map((value, index) => {
                            const point = getCoordinates(value, index);
                            return (
                                <g
                                    key={index}
                                    onMouseEnter={() => setHoveredStat({ label: labels[index], value, x: point.x, y: point.y - 12 })}
                                    onMouseLeave={() => setHoveredStat(null)}
                                >
                                    <circle cx={point.x} cy={point.y} r="6.5" fill="rgba(111,118,197,0.12)" />
                                    <circle cx={point.x} cy={point.y} r="4" fill="white" stroke="#6f6de0" strokeWidth="1.8" />
                                    <circle cx={point.x} cy={point.y} r="11" fill="transparent" className="cursor-pointer" />
                                </g>
                            );
                        })}

                        {labels.map((label, index) => {
                            const angle = (Math.PI / 3) * index - Math.PI / 2;
                            const radius = maxRadius + 24;
                            const labelX = center + radius * Math.cos(angle);
                            const labelY = center + radius * Math.sin(angle) + 2;

                            return (
                                <text
                                    key={label}
                                    x={labelX}
                                    y={labelY}
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                    className="cursor-pointer fill-slate-500 text-[10px] font-bold tracking-tight"
                                    onMouseEnter={() => setHoveredStat({ label, value: data[index], x: labelX, y: labelY - 12 })}
                                    onMouseLeave={() => setHoveredStat(null)}
                                >
                                    {label}
                                </text>
                            );
                        })}
                    </svg>
                </div>
            </div>
        </div>
    );
}
