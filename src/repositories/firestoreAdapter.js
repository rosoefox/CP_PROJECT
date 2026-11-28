// [Adapter 패턴] Firestore 문서 ↔ 앱에서 쓰는 객체 변환을 담당합니다.
//   - Adaptee : Firestore DocumentSnapshot (snapshot.id, snapshot.data(), Timestamp 타입, 누락 필드)
//   - Target  : 도메인 코드가 기대하는 평범한 객체 (id 포함, 날짜는 ISO 문자열, 측정값은 number|null)
//   - Adapter : toAnimal / toHealthRecord / toIsoString
// 화면·도메인 코드가 Firestore 타입을 알 필요가 없고, 저장소를 바꿔도 도메인 코드는 그대로입니다.

/** Timestamp(toDate 보유) · Date · 문자열을 ISO 문자열로 변환합니다. 값이 없으면 fallback을 씁니다. */
export function toIsoString(value, fallback = new Date().toISOString()) {
  if (!value) return fallback; // serverTimestamp()가 아직 서버에 반영되지 않은 경우
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

/** 측정값은 없으면 null로 통일합니다. */
function numberOrNull(value) {
  return typeof value === 'number' ? value : null;
}

export function toAnimal(snapshot) {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ownerId: data.ownerId,
    tagNumber: data.tagNumber,
    name: data.name ?? '',
    species: data.species,
    sex: data.sex,
    birthDate: data.birthDate,
    status: data.status,
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

export function toHealthRecord(snapshot) {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ownerId: data.ownerId,
    animalId: data.animalId,
    date: data.date,
    temperature: numberOrNull(data.temperature),
    feedKg: numberOrNull(data.feedKg),
    weightKg: numberOrNull(data.weightKg),
    note: data.note ?? '',
    createdAt: toIsoString(data.createdAt),
  };
}

/** 건강 기록 문서 ID: 개체+날짜 조합으로 만들어 같은 날짜 중복 저장을 구조적으로 막습니다. */
export function healthRecordId(animalId, date) {
  return `${animalId}_${date}`;
}
