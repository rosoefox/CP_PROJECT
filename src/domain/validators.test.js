import { describe, it, expect, vi } from 'vitest';
import { chain, maxLength, optional, pattern, required, rule, validateFields } from './validators';

describe('Chain of Responsibility - 검증 사슬', () => {
  const tagChain = chain(
    required('필수'),
    pattern(/^[A-Z0-9-]+$/, '형식'),
    rule((value, ctx) => !ctx.existing.includes(value), '중복'),
  );

  it('모든 단계를 통과하면 null', () => {
    expect(tagChain.handle('KR-1', { existing: [] })).toBeNull();
  });

  it('앞 단계부터 순서대로 검사해 처음 실패한 단계의 메시지를 반환', () => {
    expect(tagChain.handle('', { existing: [] })).toBe('필수');
    expect(tagChain.handle('kr#1', { existing: [] })).toBe('형식');
    expect(tagChain.handle('KR-1', { existing: ['KR-1'] })).toBe('중복');
  });

  it('앞 단계에서 실패하면 뒤 단계는 실행하지 않음', () => {
    const later = vi.fn(() => true);
    const c = chain(required('필수'), rule(later, '나중'));
    c.handle('', {});
    expect(later).not.toHaveBeenCalled();
  });

  it('optional은 빈 값이면 사슬을 통과로 끝내고, 값이 있으면 다음 단계로 전달', () => {
    const c = chain(optional(), rule((v) => v <= 10, '10 이하'));
    expect(c.handle(null, {})).toBeNull();
    expect(c.handle(5, {})).toBeNull();
    expect(c.handle(20, {})).toBe('10 이하');
  });

  it('validateFields는 필드별 사슬 결과를 모으고 context에 input을 함께 전달', () => {
    const schema = {
      name: chain(maxLength(3, '3자 이하')),
      confirm: chain(rule((v, ctx) => v === ctx.input.password, '불일치')),
    };
    expect(validateFields(schema, { name: 'abcd', password: 'x', confirm: 'y' })).toEqual({
      name: '3자 이하',
      confirm: '불일치',
    });
  });
});
