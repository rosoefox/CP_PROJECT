import { SPECIES } from './species';
import { chain, maxLength, oneOf, pattern, required, rule, validateFields } from './validators';

const TAG_PATTERN = /^[A-Za-z0-9-]{1,20}$/;

// 필드별 검증 사슬 (Chain of Responsibility, src/domain/validators.js)
const animalSchema = {
  tagNumber: chain(
    required('개체번호를 입력해주세요.'),
    pattern(TAG_PATTERN, '개체번호는 영문·숫자·하이픈(-) 20자 이내로 입력해주세요.'),
    rule((tag, ctx) => !ctx.existingTags.includes(tag), '이미 등록된 개체번호입니다.'),
  ),
  species: chain(rule((species) => Boolean(SPECIES[species]), '축종을 선택해주세요.')),
  sex: chain(oneOf(['M', 'F'], '성별을 선택해주세요.')),
  birthDate: chain(
    required('출생일을 입력해주세요.'),
    rule((date, ctx) => date <= ctx.today, '출생일은 오늘 이후일 수 없습니다.'),
  ),
  name: chain(maxLength(30, '이름은 30자 이내로 입력해주세요.')),
};

/**
 * 개체 등록 입력을 검사합니다.
 * @param {object} input  { tagNumber, species, sex, birthDate, name }
 * @param {object} options { existingTags: string[], today: 'YYYY-MM-DD' }
 * @returns {object} 필드별 오류 메시지. 비어 있으면 유효합니다.
 */
export function validateAnimal(input, { existingTags = [], today = todayString() } = {}) {
  const normalized = { ...input, tagNumber: (input.tagNumber ?? '').trim(), name: input.name ?? '' };
  return validateFields(animalSchema, normalized, { existingTags, today });
}

export function todayString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
