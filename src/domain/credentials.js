import { chain, maxLength, minLength, pattern, required, rule, validateFields } from './validators';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6;

// 필드별 검증 사슬 (Chain of Responsibility, src/domain/validators.js)
const email = chain(required('이메일을 입력해주세요.'), pattern(EMAIL_PATTERN, '이메일 형식이 올바르지 않습니다.'));

const loginSchema = {
  email,
  password: chain(required('비밀번호를 입력해주세요.')),
};

const signupSchema = {
  displayName: chain(
    required('농장(사용자) 이름을 입력해주세요.'),
    maxLength(20, '이름은 20자 이내로 입력해주세요.'),
  ),
  email,
  password: chain(
    required('비밀번호를 입력해주세요.'),
    minLength(MIN_PASSWORD_LENGTH, `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`),
  ),
  // 비밀번호를 입력한 경우에만 일치 여부 검사
  passwordConfirm: chain(
    rule((confirm, ctx) => !ctx.input.password || confirm === ctx.input.password, '비밀번호가 일치하지 않습니다.'),
  ),
};

/**
 * 로그인·회원가입 입력을 검사합니다. Firebase 요청 전에 화면에서 먼저 걸러냅니다.
 * @param {object} input { email, password, passwordConfirm, displayName }
 * @param {'login'|'signup'} mode
 * @returns {object} 필드별 오류 메시지. 비어 있으면 유효합니다.
 */
export function validateCredentials(input, mode) {
  const normalized = {
    ...input,
    email: (input.email ?? '').trim(),
    password: input.password ?? '',
    displayName: (input.displayName ?? '').trim(),
  };
  return validateFields(mode === 'signup' ? signupSchema : loginSchema, normalized);
}
