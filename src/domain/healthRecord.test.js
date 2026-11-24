import { describe, it, expect } from 'vitest';
import { toNumberOrNull, validateHealthRecord } from './healthRecord';

const opts = { today: '2026-11-23', birthDate: '2025-01-01', existingDates: ['2026-11-20'] };
const base = { date: '2026-11-21', temperature: 38.5, feedKg: null, weightKg: null, note: '' };

describe('validateHealthRecord', () => {
  it('올바른 입력은 오류 없음', () => {
    expect(validateHealthRecord(base, opts)).toEqual({});
  });

  it('같은 날짜 중복 기록은 거부', () => {
    expect(validateHealthRecord({ ...base, date: '2026-11-20' }, opts).date).toBe('해당 날짜의 기록이 이미 있습니다.');
  });

  it('미래 날짜와 출생일 이전 날짜는 거부', () => {
    expect(validateHealthRecord({ ...base, date: '2026-11-24' }, opts).date).toBeDefined();
    expect(validateHealthRecord({ ...base, date: '2024-12-31' }, opts).date).toBeDefined();
  });

  it('측정값이 하나도 없으면 거부', () => {
    expect(validateHealthRecord({ ...base, temperature: null }, opts).form).toBeDefined();
  });

  it('범위를 벗어나거나 숫자가 아닌 값은 거부', () => {
    expect(validateHealthRecord({ ...base, temperature: 60 }, opts).temperature).toBeDefined();
    expect(validateHealthRecord({ ...base, feedKg: -1 }, opts).feedKg).toBeDefined();
    expect(validateHealthRecord({ ...base, weightKg: NaN }, opts).weightKg).toBeDefined();
  });
});

describe('toNumberOrNull', () => {
  it('빈 값은 null, 숫자 문자열은 number, 그 외는 NaN', () => {
    expect(toNumberOrNull('')).toBeNull();
    expect(toNumberOrNull('38.5')).toBe(38.5);
    expect(toNumberOrNull('abc')).toBeNaN();
  });
});
