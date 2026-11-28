import { getAnimalState } from './animalState';

// [Strategy 패턴] 개체 목록 정렬 알고리즘을 교체 가능한 전략 객체로 분리합니다.
//
//   - Strategy : { key, label, compare(a, b) } 형태의 정렬 전략 인터페이스
//   - Concrete : 최근 등록순 / 개체번호순 / 나이 많은 순 / 관리 필요 우선
//   - Context  : sortAnimals(animals, strategy) — 어떤 전략인지 모르고 compare만 호출
// 사용자가 화면에서 정렬 방식을 바꾸면 전략 객체만 바뀌고, 목록 화면 코드는 그대로입니다.
// 새 정렬 기준이 필요하면 전략 객체 하나를 추가하면 됩니다.

const collator = new Intl.Collator('ko', { numeric: true, sensitivity: 'base' });

const recentFirst = {
  key: 'recent',
  label: '최근 등록순',
  compare: (a, b) => b.createdAt.localeCompare(a.createdAt),
};

const tagNumber = {
  key: 'tag',
  label: '개체번호순',
  // numeric 비교: KR-2가 KR-10보다 앞에 오도록
  compare: (a, b) => collator.compare(a.tagNumber, b.tagNumber),
};

const oldestFirst = {
  key: 'age',
  label: '나이 많은 순',
  compare: (a, b) => a.birthDate.localeCompare(b.birthDate) || collator.compare(a.tagNumber, b.tagNumber),
};

// 관리 우선순위: 치료 중 → 사육 중 → 출하·폐사(종료)
const CARE_PRIORITY = { treatment: 0, active: 1 };
const careFirst = {
  key: 'care',
  label: '관리 필요 우선',
  compare: (a, b) => {
    const priority = (animal) => (getAnimalState(animal.status).isTerminal ? 2 : CARE_PRIORITY[animal.status] ?? 1);
    return priority(a) - priority(b) || collator.compare(a.tagNumber, b.tagNumber);
  },
};

export const SORT_STRATEGIES = [recentFirst, tagNumber, oldestFirst, careFirst];
export const DEFAULT_SORT = recentFirst;

export function getSortStrategy(key) {
  return SORT_STRATEGIES.find((strategy) => strategy.key === key) ?? DEFAULT_SORT;
}

/** 원본 배열을 바꾸지 않고, 주어진 전략으로 정렬한 새 배열을 반환합니다. */
export function sortAnimals(animals, strategy = DEFAULT_SORT) {
  return [...animals].sort(strategy.compare);
}
