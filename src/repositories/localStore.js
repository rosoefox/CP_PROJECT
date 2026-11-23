// 브라우저 localStorage에 컬렉션 단위로 JSON 배열을 저장하는 임시 저장소입니다.
// Firebase 연동 전까지 사용하며, 저장소 인터페이스(async 메서드)는 Firestore 구현과 동일하게 유지합니다.
const PREFIX = 'cp-project:';

export function readCollection(name) {
  try {
    const raw = localStorage.getItem(PREFIX + name);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function writeCollection(name, items) {
  try {
    localStorage.setItem(PREFIX + name, JSON.stringify(items));
  } catch {
    throw new Error('데이터를 저장하지 못했습니다. 브라우저 저장소 설정을 확인해주세요.');
  }
}

export function newId() {
  return crypto.randomUUID();
}
