// [Decorator 패턴] 저장소에 캐시 기능을 덧씌웁니다.
//
// 대시보드·목록·상세 화면을 오갈 때마다 같은 데이터를 Firestore에서 다시 읽으면
// 응답이 느려지고 무료 요금제의 읽기 한도를 소모합니다.
// 저장소 코드를 고치지 않고, 같은 메서드를 가진 객체로 감싸 기능만 추가합니다.
//   - Component         : 원래 저장소 (Firestore 구현)
//   - Decorator         : withCache가 반환하는 객체 — 같은 메서드 이름·인자·반환 형태를 유지
//   - 추가 기능          : 조회 결과 캐시(유효 시간 ttl), 동시에 들어온 같은 조회 요청 합치기,
//                         쓰기(등록·수정) 후 캐시 비우기, 사용자별(scope) 캐시 분리
// 화면은 캐시 여부를 모르고 그대로 저장소를 호출합니다. 캐시를 빼려면 감싸지 않으면 됩니다.

/**
 * @param {object} repository 감쌀 저장소
 * @param {object} options
 * @param {string[]} options.readMethods 캐시할 조회 메서드 이름 (그 외 메서드는 쓰기로 보고 캐시를 비움)
 * @param {number} [options.ttlMs] 캐시 유효 시간
 * @param {() => string} [options.scope] 캐시를 나눌 기준 (예: 로그인 사용자 UID)
 * @param {() => number} [options.now] 현재 시각 (테스트용)
 */
export function withCache(repository, { readMethods, ttlMs = 30_000, scope = () => '', now = () => Date.now() }) {
  const cache = new Map(); // key → { promise, at }
  const decorated = {};

  for (const [name, method] of Object.entries(repository)) {
    if (typeof method !== 'function') continue;

    if (readMethods.includes(name)) {
      decorated[name] = (...args) => {
        const key = JSON.stringify([scope(), name, args]);
        const hit = cache.get(key);
        if (hit && now() - hit.at < ttlMs) return hit.promise;

        // 결과 대신 Promise를 저장해, 응답 전에 들어온 같은 요청도 한 번만 조회합니다.
        const promise = method.apply(repository, args);
        cache.set(key, { promise, at: now() });
        promise.catch(() => cache.delete(key)); // 실패한 조회는 캐시하지 않음
        return promise;
      };
    } else {
      decorated[name] = async (...args) => {
        try {
          return await method.apply(repository, args);
        } finally {
          cache.clear(); // 데이터가 바뀌었을 수 있으므로 다음 조회는 새로 읽음
        }
      };
    }
  }

  decorated.clearCache = () => cache.clear();
  return decorated;
}
