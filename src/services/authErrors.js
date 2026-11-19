// Firebase Auth 에러 코드를 사용자에게 보여줄 한국어 메시지로 변환합니다.
// Firebase SDK에 의존하지 않는 순수 함수라 단위 테스트로 검증합니다.
const MESSAGES = {
  'auth/invalid-email': '이메일 형식이 올바르지 않습니다.',
  'auth/missing-password': '비밀번호를 입력해주세요.',
  'auth/weak-password': '비밀번호는 6자 이상이어야 합니다.',
  'auth/email-already-in-use': '이미 가입된 이메일입니다.',
  'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'auth/user-not-found': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'auth/wrong-password': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'auth/too-many-requests': '시도 횟수가 너무 많습니다. 잠시 후 다시 시도해주세요.',
  'auth/network-request-failed': '네트워크 연결을 확인해주세요.',
};

export const DEFAULT_AUTH_ERROR = '로그인 처리 중 오류가 발생했습니다.';

export function toAuthErrorMessage(error) {
  const code = typeof error === 'string' ? error : error?.code;
  return MESSAGES[code] ?? DEFAULT_AUTH_ERROR;
}
