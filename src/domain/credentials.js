const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6;

/**
 * 로그인·회원가입 입력을 검사합니다. Firebase 요청 전에 화면에서 먼저 걸러냅니다.
 * @param {object} input { email, password, passwordConfirm, displayName }
 * @param {'login'|'signup'} mode
 * @returns {object} 필드별 오류 메시지. 비어 있으면 유효합니다.
 */
export function validateCredentials(input, mode) {
  const errors = {};
  const email = (input.email ?? '').trim();
  const password = input.password ?? '';

  if (!email) {
    errors.email = '이메일을 입력해주세요.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = '이메일 형식이 올바르지 않습니다.';
  }

  if (!password) {
    errors.password = '비밀번호를 입력해주세요.';
  } else if (mode === 'signup' && password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`;
  }

  if (mode === 'signup') {
    const name = (input.displayName ?? '').trim();
    if (!name) {
      errors.displayName = '농장(사용자) 이름을 입력해주세요.';
    } else if (name.length > 20) {
      errors.displayName = '이름은 20자 이내로 입력해주세요.';
    }

    if (password && input.passwordConfirm !== password) {
      errors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }
  }

  return errors;
}
