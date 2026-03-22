import { useEffect, useState } from 'react';
import { CalendarClock, Check, X } from 'lucide-react';
import { Button } from '../ui/button';
import { CourseProfessorGroup } from '../../lib/courseGroups';

interface SectionSelectDialogProps {
  open: boolean;
  group: CourseProfessorGroup | null;
  currentCourseId?: string | null;
  preferredCourseId?: string | null;
  onClose: () => void;
  onConfirm: (courseId: string) => void;
  onRemove?: () => void;
}

export function SectionSelectDialog({
  open,
  group,
  currentCourseId,
  preferredCourseId,
  onClose,
  onConfirm,
  onRemove,
}: SectionSelectDialogProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(currentCourseId ?? null);

  useEffect(() => {
    if (!group) {
      setSelectedCourseId(null);
      return;
    }

    setSelectedCourseId(preferredCourseId ?? currentCourseId ?? group.sections[0]?.id ?? null);
  }, [group, currentCourseId, preferredCourseId]);

  if (!open || !group) {
    return null;
  }

  const selectedSection = group.sections.find((section) => section.id === selectedCourseId) ?? group.sections[0];

  return (
    <>
      <button
        type="button"
        aria-label="분반 선택 닫기"
        onClick={onClose}
        className="fixed inset-0 z-[70] bg-slate-950/26 backdrop-blur-[2px]"
      />

      <div className="fixed inset-x-4 top-1/2 z-[80] mx-auto w-full max-w-[720px] -translate-y-1/2 rounded-[2rem] border border-[rgba(15,23,42,0.08)] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-[rgba(15,23,42,0.08)] px-6 py-5">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#005bac]">Timetable Pick</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              어떤 분반을 담을지 선택하세요
            </h3>
            <p className="mt-2 text-sm font-medium text-slate-500">
              {group.name} · {group.professor}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[58vh] space-y-3 overflow-y-auto px-6 py-5">
          {group.sections.map((section) => {
            const isSelected = section.id === selectedCourseId;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setSelectedCourseId(section.id)}
                className={`w-full rounded-[1.35rem] border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-[#9fc5e6] bg-[#f4f9ff] shadow-[0_16px_36px_rgba(0,91,172,0.08)]'
                    : 'border-slate-200 bg-white hover:border-[#c8d7e5] hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-black text-slate-900">{section.sectionLabel}</p>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                          section.isOpenCurrent
                            ? 'bg-[#edf4ff] text-[#005bac]'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {section.isOpenCurrent ? `${section.semesterLabel} 개설` : `${section.semesterLabel} 기록`}
                      </span>
                    </div>
                    {section.timeSummary ? (
                      <div className="mt-3 flex items-start gap-2 text-sm font-medium text-slate-600">
                        <CalendarClock className="mt-0.5 h-4 w-4 text-[#005bac]" />
                        <div>
                          <p>{section.timeSummary}</p>
                          {section.slots.length > 0 ? (
                            <p className="mt-1 text-xs text-slate-400">
                              {section.slots.map((slot) => slot.location).join(' · ')}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                      isSelected
                        ? 'border-[#005bac]/20 bg-[#005bac] text-white'
                        : 'border-slate-200 bg-white text-slate-300'
                    }`}
                  >
                    <Check className="h-4 w-4" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 border-t border-[rgba(15,23,42,0.08)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            {selectedSection ? (
              <span>
                선택됨: <span className="font-bold text-slate-800">{selectedSection.sectionLabel}</span>
              </span>
            ) : (
              '분반을 먼저 선택해주세요.'
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {currentCourseId && onRemove ? (
              <Button type="button" variant="outline" onClick={onRemove} className="rounded-full px-5">
                장바구니에서 제거
              </Button>
            ) : null}
            <Button
              type="button"
              onClick={() => selectedCourseId && onConfirm(selectedCourseId)}
              disabled={!selectedCourseId}
              className="rounded-full px-5"
            >
              {currentCourseId ? '선택한 분반으로 변경' : '이 분반 장바구니에 담기'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
