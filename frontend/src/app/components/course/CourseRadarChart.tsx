import { useState } from 'react';

interface CourseRadarChartProps {
    data: number[];
    labels: string[];
}

export function CourseRadarChart({ data, labels }: CourseRadarChartProps) {
    const center = 120;
    const maxRadius = 88;
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

    return (
        <div className="relative mx-auto flex w-full max-w-[360px] items-center justify-center py-1">
            {hoveredStat && (
                <div
                    className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-xl border border-[rgba(15,23,42,0.08)] bg-white px-3 py-2 text-center shadow-[0_16px_30px_rgba(15,23,42,0.14)]"
                    style={{
                        left: `${(hoveredStat.x / 240) * 100}%`,
                        top: `${(hoveredStat.y / 240) * 100}%`,
                    }}
                >
                    <p className="text-[11px] font-bold text-slate-400">{hoveredStat.label}</p>
                    <p className="mt-1 text-base font-black text-[#5a74ff]">{hoveredStat.value.toFixed(1)}</p>
                </div>
            )}

            <div className="relative aspect-square w-full max-w-[332px]">
                <div
                    className="absolute inset-[1%]"
                    style={{
                        clipPath: 'polygon(50% 0%, 92% 25%, 92% 75%, 50% 100%, 8% 75%, 8% 25%)',
                        background: 'linear-gradient(180deg, rgba(155,177,255,0.18) 0%, rgba(198,184,243,0.12) 58%, rgba(233,220,243,0.08) 100%)',
                        filter: 'blur(6px)',
                        opacity: 0.9,
                    }}
                />
                <div
                    className="absolute inset-[11%]"
                    style={{
                        clipPath: 'polygon(50% 0%, 92% 25%, 92% 75%, 50% 100%, 8% 75%, 8% 25%)',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(247,249,253,0.76) 100%)',
                        border: '1px solid rgba(214,224,240,0.42)',
                    }}
                />
                <div
                    className="absolute inset-[19%]"
                    style={{
                        clipPath: 'polygon(50% 0%, 92% 25%, 92% 75%, 50% 100%, 8% 75%, 8% 25%)',
                        background: 'rgba(255,255,255,0.58)',
                        border: '1px solid rgba(223,231,243,0.72)',
                    }}
                />

                <svg viewBox="0 0 240 240" className="relative z-10 h-full w-full overflow-visible">
                    <defs>
                        <linearGradient id="course-radar-fill" x1="0%" x2="100%" y1="0%" y2="100%">
                            <stop offset="0%" stopColor="#92abff" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#b7a5ea" stopOpacity="0.18" />
                        </linearGradient>
                        <linearGradient id="course-radar-stroke" x1="0%" x2="100%" y1="0%" y2="100%">
                            <stop offset="0%" stopColor="#7189ff" />
                            <stop offset="100%" stopColor="#8d79de" />
                        </linearGradient>
                        <filter id="course-radar-glow" x="-40%" y="-40%" width="180%" height="180%">
                            <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#9d95ee" floodOpacity="0.1" />
                        </filter>
                    </defs>

                    {guides.map((points, index) => (
                        <polygon
                            key={index}
                            points={points}
                            fill={index === guides.length - 1 ? 'rgba(255,255,255,0.24)' : 'none'}
                            stroke={index === guides.length - 1 ? 'rgba(203,214,233,0.92)' : 'rgba(237,241,248,0.82)'}
                            strokeWidth={index === guides.length - 1 ? '1.35' : '0.72'}
                        />
                    ))}

                    <polygon
                        points={polygonPoints}
                        fill="url(#course-radar-fill)"
                        filter="url(#course-radar-glow)"
                        stroke="url(#course-radar-stroke)"
                        strokeWidth="2.3"
                        strokeLinejoin="round"
                        className="transition-all duration-700 ease-out"
                    />

                    {data.map((value, index) => {
                        const point = getCoordinates(value, index);
                        return (
                            <g
                                key={index}
                                onMouseEnter={() => setHoveredStat({ label: labels[index], value, x: point.x, y: point.y - 10 })}
                                onMouseLeave={() => setHoveredStat(null)}
                            >
                                <circle cx={point.x} cy={point.y} r="12" fill="transparent" className="cursor-pointer" />
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
                                className="cursor-pointer fill-slate-600 text-[10px] font-bold tracking-tight"
                                onMouseEnter={() => setHoveredStat({ label, value: data[index], x: labelX, y: labelY - 10 })}
                                onMouseLeave={() => setHoveredStat(null)}
                            >
                                {label}
                            </text>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}
