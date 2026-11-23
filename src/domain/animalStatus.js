// 개체 상태와 상태 전이 규칙
// 출하·폐사는 종료 상태로, 이후 상태 변경과 새 건강 기록 추가를 막습니다.
export const ANIMAL_STATUS = {
  active: { label: '사육 중', tone: 'ok', terminal: false, next: ['treatment', 'shipped', 'dead'] },
  treatment: { label: '치료 중', tone: 'warn', terminal: false, next: ['active', 'shipped', 'dead'] },
  shipped: { label: '출하', tone: 'muted', terminal: true, next: [] },
  dead: { label: '폐사', tone: 'danger', terminal: true, next: [] },
};

export function getStatus(key) {
  return ANIMAL_STATUS[key] ?? ANIMAL_STATUS.active;
}

export function canTransition(from, to) {
  return getStatus(from).next.includes(to);
}

/** 종료 상태(출하·폐사)가 아닌 개체만 기록 추가·수정이 가능합니다. */
export function isEditable(status) {
  return !getStatus(status).terminal;
}
