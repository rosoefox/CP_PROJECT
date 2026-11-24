import { describe, it, expect } from 'vitest';
import { validateAnimal } from './animalValidation';

const valid = { tagNumber: 'KR-0001', species: 'cattle', sex: 'F', birthDate: '2025-03-01', name: '누렁이' };
const opts = { today: '2026-11-23' };

describe('validateAnimal', () => {
  it('올바른 입력은 오류 없음', () => {
    expect(validateAnimal(valid, opts)).toEqual({});
  });

  it('개체번호 누락·형식 오류', () => {
    expect(validateAnimal({ ...valid, tagNumber: '  ' }, opts).tagNumber).toBeDefined();
    expect(validateAnimal({ ...valid, tagNumber: '번호#1' }, opts).tagNumber).toBeDefined();
  });

  it('이미 등록된 개체번호는 거부', () => {
    const errors = validateAnimal(valid, { ...opts, existingTags: ['KR-0001'] });
    expect(errors.tagNumber).toBe('이미 등록된 개체번호입니다.');
  });

  it('알 수 없는 축종·성별은 거부', () => {
    const errors = validateAnimal({ ...valid, species: 'dragon', sex: 'X' }, opts);
    expect(errors.species).toBeDefined();
    expect(errors.sex).toBeDefined();
  });

  it('미래 출생일은 거부, 오늘은 허용', () => {
    expect(validateAnimal({ ...valid, birthDate: '2026-11-24' }, opts).birthDate).toBeDefined();
    expect(validateAnimal({ ...valid, birthDate: '2026-11-23' }, opts).birthDate).toBeUndefined();
  });
});
