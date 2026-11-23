import { SPECIES } from './species';

const TAG_PATTERN = /^[A-Za-z0-9-]{1,20}$/;

/**
 * 개체 등록 입력을 검사합니다.
 * @param {object} input  { tagNumber, species, sex, birthDate, name }
 * @param {object} options { existingTags: string[], today: 'YYYY-MM-DD' }
 * @returns {object} 필드별 오류 메시지. 비어 있으면 유효합니다.
 */
export function validateAnimal(input, { existingTags = [], today = todayString() } = {}) {
  const errors = {};
  const tag = (input.tagNumber ?? '').trim();

  if (!tag) {
    errors.tagNumber = '개체번호를 입력해주세요.';
  } else if (!TAG_PATTERN.test(tag)) {
    errors.tagNumber = '개체번호는 영문·숫자·하이픈(-) 20자 이내로 입력해주세요.';
  } else if (existingTags.includes(tag)) {
    errors.tagNumber = '이미 등록된 개체번호입니다.';
  }

  if (!SPECIES[input.species]) {
    errors.species = '축종을 선택해주세요.';
  }

  if (!['M', 'F'].includes(input.sex)) {
    errors.sex = '성별을 선택해주세요.';
  }

  if (!input.birthDate) {
    errors.birthDate = '출생일을 입력해주세요.';
  } else if (input.birthDate > today) {
    errors.birthDate = '출생일은 오늘 이후일 수 없습니다.';
  }

  if ((input.name ?? '').length > 30) {
    errors.name = '이름은 30자 이내로 입력해주세요.';
  }

  return errors;
}

export function todayString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
