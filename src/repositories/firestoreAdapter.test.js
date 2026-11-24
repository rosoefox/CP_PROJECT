import { describe, it, expect } from 'vitest';
import { healthRecordId, toAnimal, toHealthRecord, toIsoString } from './firestoreAdapter';

// Firestore DocumentSnapshot과 Timestamp를 흉내 내는 테스트용 객체
const fakeSnapshot = (id, data) => ({ id, data: () => data });
const fakeTimestamp = (iso) => ({ toDate: () => new Date(iso) });

describe('toIsoString', () => {
  it('Timestamp·Date·문자열을 ISO 문자열로 변환', () => {
    expect(toIsoString(fakeTimestamp('2026-11-20T00:00:00.000Z'))).toBe('2026-11-20T00:00:00.000Z');
    expect(toIsoString(new Date('2026-11-20T00:00:00.000Z'))).toBe('2026-11-20T00:00:00.000Z');
    expect(toIsoString('2026-11-20T00:00:00.000Z')).toBe('2026-11-20T00:00:00.000Z');
  });

  it('값이 없으면(서버 시간 미반영) fallback 사용', () => {
    expect(toIsoString(null, 'fallback')).toBe('fallback');
  });
});

describe('toAnimal', () => {
  it('문서를 개체 객체로 변환하고 누락된 이름은 빈 문자열', () => {
    const animal = toAnimal(
      fakeSnapshot('a1', {
        ownerId: 'u1',
        tagNumber: 'KR-1',
        species: 'cattle',
        sex: 'F',
        birthDate: '2025-01-01',
        status: 'active',
        createdAt: fakeTimestamp('2026-11-20T00:00:00.000Z'),
        updatedAt: fakeTimestamp('2026-11-21T00:00:00.000Z'),
      }),
    );
    expect(animal).toMatchObject({ id: 'a1', name: '', createdAt: '2026-11-20T00:00:00.000Z' });
  });
});

describe('toHealthRecord', () => {
  it('측정값이 없거나 숫자가 아니면 null', () => {
    const record = toHealthRecord(
      fakeSnapshot('a1_2026-11-20', { ownerId: 'u1', animalId: 'a1', date: '2026-11-20', temperature: 38.5, feedKg: undefined }),
    );
    expect(record.temperature).toBe(38.5);
    expect(record.feedKg).toBeNull();
    expect(record.weightKg).toBeNull();
  });
});

describe('healthRecordId', () => {
  it('개체 ID와 날짜를 조합', () => {
    expect(healthRecordId('a1', '2026-11-20')).toBe('a1_2026-11-20');
  });
});
