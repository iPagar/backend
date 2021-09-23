function getCurrentSemester() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();

  if (month >= 2 && month <= 6) return `${year}-весна`;
  if (month >= 9 && month < 2) return `${year}-осень`;
  return undefined;
}

export function isCurrentSemester(semester: string): boolean {
  const currentSemester = getCurrentSemester();
  if (semester === currentSemester) return true;
  return false;
}
