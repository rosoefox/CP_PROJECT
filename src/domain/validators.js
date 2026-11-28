import { isNonEmpty } from '../utils/validation';

// [Chain of Responsibility 패턴] 입력 검증 단계를 처리기(Handler) 사슬로 연결합니다.
//
// 하나의 필드는 "필수 입력 → 형식 → 범위 → 중복"처럼 여러 단계를 순서대로 검사하고,
// 앞 단계에서 실패하면 뒤 단계는 실행하지 않고 그 오류를 결과로 돌려줘야 합니다.
// 기존에는 필드마다 if / else if 사슬을 직접 작성해 폼마다 같은 구조가 반복되었습니다.
//   - Handler         : ValidationHandler — setNext로 다음 처리기를 연결, handle로 검사 후 전달
//   - ConcreteHandler : RuleHandler(조건 검사), OptionalHandler(빈 값이면 사슬 종료)
//   - Client          : validateFields — 필드별 사슬의 첫 처리기에 값을 넘기기만 함
// 단계 추가·순서 변경은 chain(...) 인자만 바꾸면 되고, 처리기는 여러 폼에서 재사용합니다.

export class ValidationHandler {
  constructor() {
    this.next = null;
  }

  /** 다음 처리기를 연결하고, 연속 연결을 위해 그 처리기를 반환합니다. */
  setNext(handler) {
    this.next = handler;
    return handler;
  }

  /** 이 단계에서 처리(오류 반환)하거나 다음 처리기로 넘깁니다. 끝까지 통과하면 null. */
  handle(value, context) {
    return this.next ? this.next.handle(value, context) : null;
  }
}

/** 조건을 만족하지 않으면 오류 메시지를 반환하고 사슬을 멈춥니다. */
class RuleHandler extends ValidationHandler {
  constructor(isValid, message) {
    super();
    this.isValid = isValid;
    this.message = message;
  }

  handle(value, context) {
    if (!this.isValid(value, context)) return this.message;
    return super.handle(value, context);
  }
}

/** 값이 비어 있으면 검사할 것이 없으므로 사슬을 통과(null)로 끝냅니다. 선택 입력 필드용. */
class OptionalHandler extends ValidationHandler {
  handle(value, context) {
    if (value === null || value === undefined || value === '') return null;
    return super.handle(value, context);
  }
}

// ── 처리기 생성 함수 ─────────────────────────────

const hasValue = (value) => (typeof value === 'string' ? isNonEmpty(value) : value !== null && value !== undefined);

export const required = (message) => new RuleHandler(hasValue, message);
export const optional = () => new OptionalHandler();
export const pattern = (regex, message) => new RuleHandler((value) => regex.test(value), message);
export const minLength = (length, message) => new RuleHandler((value) => (value ?? '').length >= length, message);
export const maxLength = (length, message) => new RuleHandler((value) => (value ?? '').length <= length, message);
export const oneOf = (values, message) => new RuleHandler((value) => values.includes(value), message);
/** 임의 조건: isValid(value, context) */
export const rule = (isValid, message) => new RuleHandler(isValid, message);

/** 처리기들을 순서대로 연결하고 첫 처리기를 반환합니다. */
export function chain(...handlers) {
  handlers.reduce((current, next) => current.setNext(next));
  return handlers[0];
}

/**
 * 필드별 사슬로 입력 전체를 검사합니다.
 * @param {Record<string, ValidationHandler>} schema 필드 이름 → 사슬의 첫 처리기
 * @param {object} input 검사할 값
 * @param {object} context 중복 목록·오늘 날짜 등 검사에 필요한 정보 (input도 함께 전달됨)
 * @returns {object} 필드별 오류 메시지. 비어 있으면 유효합니다.
 */
export function validateFields(schema, input, context = {}) {
  const errors = {};
  for (const [field, handler] of Object.entries(schema)) {
    const error = handler.handle(input[field], { ...context, input });
    if (error) errors[field] = error;
  }
  return errors;
}
