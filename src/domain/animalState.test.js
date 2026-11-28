import { describe, it, expect } from 'vitest';
import { AnimalState, getAnimalState } from './animalState';

describe('State 패턴 - 개체 상태', () => {
  it('상태 키로 해당 상태 객체를 얻고, 같은 키는 같은 객체를 공유', () => {
    expect(getAnimalState('treatment').label).toBe('치료 중');
    expect(getAnimalState('active')).toBe(getAnimalState('active'));
    expect(getAnimalState('active')).toBeInstanceOf(AnimalState);
  });

  it('알 수 없는 키는 사육 중으로 처리', () => {
    expect(getAnimalState('unknown').key).toBe('active');
  });

  it('사육 중 ↔ 치료 중 전이 가능, 전이 결과로 다음 상태 객체 반환', () => {
    expect(getAnimalState('active').changeTo('treatment').key).toBe('treatment');
    expect(getAnimalState('treatment').changeTo('active').key).toBe('active');
  });

  it('출하·폐사 이후에는 어떤 상태로도 전이 불가 (오류)', () => {
    expect(() => getAnimalState('shipped').changeTo('active')).toThrow("'출하' 상태에서는");
    expect(() => getAnimalState('dead').changeTo('treatment')).toThrow();
  });

  it('같은 상태로의 전이는 허용하지 않음', () => {
    expect(getAnimalState('active').canChangeTo('active')).toBe(false);
  });

  it('종료 상태는 기록 추가 불가, 사육·치료 중은 가능', () => {
    expect(getAnimalState('active').canAddRecord()).toBe(true);
    expect(getAnimalState('treatment').canAddRecord()).toBe(true);
    expect(getAnimalState('shipped').canAddRecord()).toBe(false);
    expect(getAnimalState('dead').canAddRecord()).toBe(false);
  });

  it('종료 상태로 바꿀 때만 확인 문구가 있음', () => {
    expect(getAnimalState('treatment').confirmMessage()).toBeNull();
    expect(getAnimalState('dead').confirmMessage()).toContain('폐사');
  });
});
