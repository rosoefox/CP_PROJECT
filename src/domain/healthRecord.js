import { todayString } from './animalValidation';
import { chain, maxLength, optional, required, rule, validateFields } from './validators';

const LIMITS = {
  temperature: { min: 30, max: 45, label: '체온' },
  feedKg: { min: 0, max: 1000, label: '사료 섭취량' },
  weightKg: { min: 0.01, max: 3000, label: '체중' },
};

export const MEASURE_FIELDS = Object.keys(LIMITS);

/** 빈 문자열은 null, 숫자 문자열은 number로 변환합니다. */
export function toNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
}

// 측정값: 선택 입력 → 입력했다면 범위 검사
const measureChain = ({ min, max, label }) =>
  chain(
    optional(),
    rule((value) => !Number.isNaN(value) && value >= min && value <= max, `${label}은(는) ${min}~${max} 범위의 숫자로 입력해주세요.`),
  );

// 필드별 검증 사슬 (Chain of Responsibility, src/domain/validators.js)
const recordSchema = {
  date: chain(
    required('기록 날짜를 입력해주세요.'),
    rule((date, ctx) => date <= ctx.today, '미래 날짜는 기록할 수 없습니다.'),
    rule((date, ctx) => !ctx.birthDate || date >= ctx.birthDate, '출생일 이전 날짜는 기록할 수 없습니다.'),
    rule((date, ctx) => !ctx.existingDates.includes(date), '해당 날짜의 기록이 이미 있습니다.'),
  ),
  ...Object.fromEntries(MEASURE_FIELDS.map((field) => [field, measureChain(LIMITS[field])])),
  note: chain(maxLength(200, '메모는 200자 이내로 입력해주세요.')),
};

/**
 * 건강 기록 입력을 검사합니다.
 * @param {object} input { date, temperature, feedKg, weightKg, note } (숫자는 number|null)
 * @param {object} options { existingDates: string[], birthDate, today }
 */
export function validateHealthRecord(input, { existingDates = [], birthDate, today = todayString() } = {}) {
  const errors = validateFields(recordSchema, input, { existingDates, birthDate, today });

  const hasMeasure = MEASURE_FIELDS.some((field) => input[field] !== null && input[field] !== undefined);
  if (!hasMeasure) {
    errors.form = '체온·사료 섭취량·체중 중 하나 이상 입력해주세요.';
  }

  return errors;
}
