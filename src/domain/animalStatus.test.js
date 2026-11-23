import { describe, it, expect } from 'vitest';
import { canTransition, isEditable } from './animalStatus';

describe('개체 상태 전이', () => {
  it('사육 중 ↔ 치료 중 전환 가능', () => {
    expect(canTransition('active', 'treatment')).toBe(true);
    expect(canTransition('treatment', 'active')).toBe(true);
  });

  it('출하·폐사 이후에는 어떤 상태로도 변경 불가', () => {
    expect(canTransition('shipped', 'active')).toBe(false);
    expect(canTransition('dead', 'treatment')).toBe(false);
  });

  it('출하·폐사 개체는 편집 불가', () => {
    expect(isEditable('active')).toBe(true);
    expect(isEditable('treatment')).toBe(true);
    expect(isEditable('shipped')).toBe(false);
    expect(isEditable('dead')).toBe(false);
  });
});
