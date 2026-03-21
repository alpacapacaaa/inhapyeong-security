export type SemesterTerm = 1 | 2;

export const compareSemesterLabel = (a: string, b: string) => {
  const [aYear, aTermRaw] = a.replace('학기', '').split('-');
  const [bYear, bTermRaw] = b.replace('학기', '').split('-');
  const aYearNumber = Number(aYear);
  const bYearNumber = Number(bYear);
  const aTerm = Number(aTermRaw);
  const bTerm = Number(bTermRaw);

  if (aYearNumber !== bYearNumber) {
    return bYearNumber - aYearNumber;
  }

  return bTerm - aTerm;
};

export const getCurrentSemesterTerm = (date = new Date()): { year: number; term: SemesterTerm } => {
  const month = date.getMonth() + 1;
  return {
    year: date.getFullYear(),
    term: month >= 8 ? 2 : 1,
  };
};

export const formatSemesterLabel = (year: number, term: SemesterTerm) => `${year}-${term}학기`;

export const formatSemesterShortLabel = (year: number, term: SemesterTerm) =>
  `${String(year).slice(-2)}-${term}`;

export const buildSemesterOptions = (startYear: number, startTerm: SemesterTerm, date = new Date()) => {
  const { year: currentYear, term: currentTerm } = getCurrentSemesterTerm(date);
  const semesters: string[] = [];

  let year = startYear;
  let term = startTerm;
  while (year < currentYear || (year === currentYear && term <= currentTerm)) {
    semesters.push(formatSemesterLabel(year, term));
    if (term === 1) {
      term = 2;
    } else {
      year += 1;
      term = 1;
    }
  }

  return semesters.sort(compareSemesterLabel);
};

export const CURRENT_SEMESTER_LABEL = (() => {
  const { year, term } = getCurrentSemesterTerm();
  return formatSemesterLabel(year, term);
})();

export const CURRENT_SEMESTER_SHORT_LABEL = (() => {
  const { year, term } = getCurrentSemesterTerm();
  return formatSemesterShortLabel(year, term);
})();
