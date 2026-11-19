import { describe, it, expect } from 'vitest';
import { toAuthErrorMessage, DEFAULT_AUTH_ERROR } from './authErrors';

describe('toAuthErrorMessage', () => {
  it('알려진 에러 코드는 해당 한국어 메시지로 변환', () => {
    expect(toAuthErrorMessage({ code: 'auth/email-already-in-use' })).toBe(
      '이미 가입된 이메일입니다.',
    );
  });

  it('잘못된 계정 정보 관련 코드는 같은 메시지로 통일 (계정 존재 여부 노출 방지)', () => {
    const a = toAuthErrorMessage({ code: 'auth/user-not-found' });
    const b = toAuthErrorMessage({ code: 'auth/wrong-password' });
    const c = toAuthErrorMessage({ code: 'auth/invalid-credential' });
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it('코드 문자열을 직접 넘겨도 동작', () => {
    expect(toAuthErrorMessage('auth/weak-password')).toBe(
      '비밀번호는 6자 이상이어야 합니다.',
    );
  });

  it('알 수 없는 코드나 빈 값은 기본 메시지', () => {
    expect(toAuthErrorMessage({ code: 'auth/unknown' })).toBe(DEFAULT_AUTH_ERROR);
    expect(toAuthErrorMessage(null)).toBe(DEFAULT_AUTH_ERROR);
    expect(toAuthErrorMessage(undefined)).toBe(DEFAULT_AUTH_ERROR);
  });
});
