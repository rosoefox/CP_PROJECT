import { todayString } from './animalValidation';

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

/**
 * 건강 기록 입력을 검사합니다.
 * @param {object} input { date, temperature, feedKg, weightKg, note } (숫자는 number|null)
 * @param {object} options { existingDates: string[], birthDate, today }
 */
export function validateHealthRecord(input, { existingDates = [], birthDate, today = todayString() } = {}) {
  const errors = {};

  if (!input.date) {
    errors.date = '기록 날짜를 입력해주세요.';
  } else if (input.date > today) {
    errors.date = '미래 날짜는 기록할 수 없습니다.';
  } else if (birthDate && input.date < birthDate) {
    errors.date = '출생일 이전 날짜는 기록할 수 없습니다.';
  } else if (existingDates.includes(input.date)) {
    errors.date = '해당 날짜의 기록이 이미 있습니다.';
  }

  for (const field of MEASURE_FIELDS) {
    const value = input[field];
    if (value === null || value === undefined) continue;
    const { min, max, label } = LIMITS[field];
    if (Number.isNaN(value) || value < min || value > max) {
      errors[field] = `${label}은(는) ${min}~${max} 범위의 숫자로 입력해주세요.`;
    }
  }

  const hasMeasure = MEASURE_FIELDS.some((field) => input[field] !== null && input[field] !== undefined);
  if (!hasMeasure) {
    errors.form = '체온·사료 섭취량·체중 중 하나 이상 입력해주세요.';
  }

  if ((input.note ?? '').length > 200) {
    errors.note = '메모는 200자 이내로 입력해주세요.';
  }

  return errors;
}
