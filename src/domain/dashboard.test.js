import { describe, it, expect } from 'vitest';
import { buildDashboard } from './dashboard';

const today = '2026-11-23';
const animals = [
  { id: 'a', species: 'cattle', status: 'active' },
  { id: 'b', species: 'cattle', status: 'treatment' },
  { id: 'c', species: 'pig', status: 'active' },
  { id: 'd', species: 'pig', status: 'shipped' },
];
const records = [
  { animalId: 'a', date: '2026-11-23', temperature: 38.5 }, // 정상, 오늘 기록
  { animalId: 'b', date: '2026-11-22', temperature: 37.0 }, // 저체온(warn)
  { animalId: 'c', date: '2026-11-23', temperature: 41.0 }, // 발열(danger)
  { animalId: 'd', date: '2026-11-23', temperature: 42.0 }, // 출하 개체는 집계 제외
];

describe('buildDashboard', () => {
  const result = buildDashboard(animals, records, today);

  it('출하·폐사를 제외하고 사육 두수와 축종별 두수를 계산', () => {
    expect(result.totalCount).toBe(3);
    expect(result.treatmentCount).toBe(1);
    expect(result.speciesCount).toEqual({ cattle: 2, pig: 1 });
  });

  it('이상 개체는 위험(danger) 수준이 먼저 오도록 정렬', () => {
    expect(result.alerts.map((item) => item.animal.id)).toEqual(['c', 'b']);
  });

  it('오늘 기록이 없는 사육 개체를 찾음', () => {
    expect(result.notRecordedToday.map((animal) => animal.id)).toEqual(['b']);
  });

  it('데이터가 없으면 0과 빈 목록', () => {
    const empty = buildDashboard([], [], today);
    expect(empty.totalCount).toBe(0);
    expect(empty.alerts).toEqual([]);
  });
});
