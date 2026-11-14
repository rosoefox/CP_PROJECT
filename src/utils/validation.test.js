import { describe, it, expect } from 'vitest';
import { isNonEmpty } from './validation';

describe('isNonEmpty', () => {
  it('내용이 있는 문자열은 true', () => {
    expect(isNonEmpty('hello')).toBe(true);
  });

  it('빈 문자열과 공백만 있는 문자열은 false', () => {
    expect(isNonEmpty('')).toBe(false);
    expect(isNonEmpty('   ')).toBe(false);
  });

  it('문자열이 아닌 값은 false', () => {
    expect(isNonEmpty(null)).toBe(false);
    expect(isNonEmpty(undefined)).toBe(false);
    expect(isNonEmpty(123)).toBe(false);
  });
});
