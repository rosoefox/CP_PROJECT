/**
 * 문자열 입력이 비어 있지 않은지 검사합니다.
 * 공백만 있는 값도 빈 입력으로 처리합니다.
 */
export function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
