import { describe, it, expect } from 'vitest';
import { validateCredentials } from './credentials';

describe('validateCredentials - 로그인', () => {
  it('이메일·비밀번호가 있으면 통과 (로그인은 길이 검사 안 함)', () => {
    expect(validateCredentials({ email: 'a@test.com', password: '123' }, 'login')).toEqual({});
  });

  it('빈 값과 잘못된 이메일 형식은 거부', () => {
    const errors = validateCredentials({ email: 'not-email', password: '' }, 'login');
    expect(errors.email).toBe('이메일 형식이 올바르지 않습니다.');
    expect(errors.password).toBe('비밀번호를 입력해주세요.');
  });
});

describe('validateCredentials - 회원가입', () => {
  const valid = { email: 'a@test.com', password: 'secret1', passwordConfirm: 'secret1', displayName: '행복농장' };

  it('올바른 입력은 통과', () => {
    expect(validateCredentials(valid, 'signup')).toEqual({});
  });

  it('비밀번호 6자 미만은 거부', () => {
    expect(validateCredentials({ ...valid, password: '12345', passwordConfirm: '12345' }, 'signup').password).toBeDefined();
  });

  it('비밀번호 확인 불일치는 거부', () => {
    expect(validateCredentials({ ...valid, passwordConfirm: 'other' }, 'signup').passwordConfirm).toBeDefined();
  });

  it('이름 누락·20자 초과는 거부', () => {
    expect(validateCredentials({ ...valid, displayName: '  ' }, 'signup').displayName).toBeDefined();
    expect(validateCredentials({ ...valid, displayName: 'a'.repeat(21) }, 'signup').displayName).toBeDefined();
  });
});
