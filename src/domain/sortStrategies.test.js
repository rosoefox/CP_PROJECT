import { describe, it, expect } from 'vitest';
import { DEFAULT_SORT, getSortStrategy, sortAnimals } from './sortStrategies';

const animals = [
  { tagNumber: 'KR-10', birthDate: '2024-05-01', status: 'active', createdAt: '2026-11-01T00:00:00Z' },
  { tagNumber: 'KR-2', birthDate: '2023-01-01', status: 'dead', createdAt: '2026-11-03T00:00:00Z' },
  { tagNumber: 'KR-1', birthDate: '2025-03-01', status: 'treatment', createdAt: '2026-11-02T00:00:00Z' },
];
const tags = (list) => list.map((animal) => animal.tagNumber);

describe('Strategy 패턴 - 개체 정렬', () => {
  it('최근 등록순', () => {
    expect(tags(sortAnimals(animals, getSortStrategy('recent')))).toEqual(['KR-2', 'KR-1', 'KR-10']);
  });

  it('개체번호순은 숫자를 자연스럽게 비교 (KR-2 < KR-10)', () => {
    expect(tags(sortAnimals(animals, getSortStrategy('tag')))).toEqual(['KR-1', 'KR-2', 'KR-10']);
  });

  it('나이 많은 순', () => {
    expect(tags(sortAnimals(animals, getSortStrategy('age')))).toEqual(['KR-2', 'KR-10', 'KR-1']);
  });

  it('관리 필요 우선: 치료 중 → 사육 중 → 종료 상태', () => {
    expect(tags(sortAnimals(animals, getSortStrategy('care')))).toEqual(['KR-1', 'KR-10', 'KR-2']);
  });

  it('알 수 없는 키는 기본 전략, 원본 배열은 바꾸지 않음', () => {
    expect(getSortStrategy('nope')).toBe(DEFAULT_SORT);
    const before = tags(animals);
    sortAnimals(animals, getSortStrategy('tag'));
    expect(tags(animals)).toEqual(before);
  });
});
