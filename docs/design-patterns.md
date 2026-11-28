# 디자인 패턴 적용 목록

축산 케어에 적용한 디자인 패턴 10종의 적용 위치, 해결한 문제, 검증 근거를 정리합니다.
보고서 "03 디자인 패턴 적용"의 기초 자료입니다.

## 계층 구조

```
화면 (pages/, components/)
  │  업무 단위 요청            ▲ 이벤트 구독 (Observer)
  ▼                           │
서비스 (services/)  ── 발행 ──▶ EventBus (lib/eventBus.js)
  │  livestockService: 상태 규칙 확인 → 저장 → 판정 → 이벤트 발행
  │  authService (Facade)
  ▼
도메인 규칙 (domain/)          저장소 (repositories/)
  State · Strategy · Factory    Repository + Decorator(캐시) + Adapter
  Chain of Responsibility        │
                                 ▼
                         Firebase (lib/firebase.js, Singleton)
```

## 적용 목록

| # | 패턴 | 적용 기능 | 주요 위치 | 테스트 |
|---|---|---|---|---|
| 1 | Singleton | Firebase 인스턴스, 공용 이벤트 버스 | `src/lib/firebase.js`, `src/lib/eventBus.js`(`domainEvents`) | — |
| 2 | Facade | 회원가입·로그인·로그아웃 | `src/services/authService.js` | `authErrors.test.js` |
| 3 | Repository | 개체·건강 기록·사용자 데이터 접근 | `src/repositories/animalRepository.js`, `recordRepository.js`, `userRepository.js` | 서비스 테스트(가짜 저장소 주입) |
| 4 | Adapter | Firestore 문서 ↔ 앱 객체 변환 | `src/repositories/firestoreAdapter.js` | `firestoreAdapter.test.js` |
| 5 | State | 개체 상태(사육 중/치료 중/출하/폐사)별 허용 동작 | `src/domain/animalState.js` | `animalState.test.js` |
| 6 | Strategy | 개체 목록 정렬 방식 선택 | `src/domain/sortStrategies.js`, `AnimalListPage.jsx` | `sortStrategies.test.js` |
| 7 | Factory | 축종별 이상 징후 판정기 생성 | `src/domain/anomaly.js`(`createAnomalyDetector`) | `anomaly.test.js` |
| 8 | Chain of Responsibility | 입력 검증 단계 연결 | `src/domain/validators.js`, `animalValidation.js`, `healthRecord.js`, `credentials.js` | `validators.test.js` 외 |
| 9 | Observer | 이상 징후·기록 저장·상태 변경 알림 | `src/lib/eventBus.js`, `src/services/livestockService.js`, `NotificationCenter.jsx` | `eventBus.test.js`, `livestockService.test.js` |
| 10 | Decorator | 저장소 조회 캐시 | `src/repositories/withCache.js` | `withCache.test.js` |

## 패턴별 요약

### 1. Singleton
- **문제:** Firebase App·Auth·Firestore는 로그인 상태와 연결을 인스턴스 단위로 유지한다. 모듈마다 초기화하면 로그인 상태가 어긋나고 중복 초기화 오류가 난다.
- **적용:** `firebase.js`가 `getApps()`로 기존 앱을 재사용해 하나만 만들고, `auth`·`db`를 내보낸다. 이벤트 버스(`domainEvents`)도 발행자와 구독자가 같은 인스턴스를 써야 연결되므로 하나만 만든다.
- **한계:** ES 모듈 캐시에 기대는 방식이라 테스트에서 교체하기 어렵다. 그래서 서비스는 이벤트 버스를 주입받도록 만들었다.

### 2. Facade
- **문제:** 회원가입 한 번에 Firebase Auth 계정 생성, 프로필 이름 설정, Firestore 프로필 문서 생성, 오류 메시지 변환이 필요하다. 화면이 이 순서를 직접 알면 결합이 커진다.
- **적용:** `authService.signUp/signIn/signOut/subscribe`가 하위 시스템을 감싼다. 화면은 Firebase Auth를 import하지 않는다.

### 3. Repository
- **문제:** 화면이 Firestore 쿼리를 직접 쓰면 저장 방식이 바뀔 때 모든 화면을 고쳐야 한다.
- **적용:** `list/get/create/update` 인터페이스로 데이터 접근을 감쌌다. 모든 조회는 `ownerId == 로그인 UID`로 한정한다.
- **검증:** 실제로 localStorage 구현을 Firestore 구현으로 교체할 때 화면 코드를 바꾸지 않았다(커밋 `f3e9832`). 서비스 테스트는 가짜 저장소를 주입해 Firestore 없이 실행된다.

### 4. Adapter
- **문제:** Firestore 문서는 `snapshot.data()` 형태이고, 날짜는 `Timestamp` 타입이며, 서버 시간이 반영되기 전에는 `null`이다. 측정값이 아예 없을 수도 있다.
- **적용:** `toAnimal/toHealthRecord/toIsoString`이 도메인이 기대하는 평범한 객체(ISO 날짜, number|null)로 변환한다.

### 5. State
- **문제:** 상태에 따라 갈 수 있는 다음 상태, 기록 추가 가능 여부, 확인 문구가 다르다. 기존에는 설정 객체와 `canTransition/isEditable` 함수, 화면의 상태 키 비교로 흩어져 있었다.
- **적용:** `AnimalState` 추상 상태와 `ActiveState/TreatmentState/ShippedState/DeadState`(종료 상태 공통 동작은 `TerminalState`). 화면·서비스·대시보드는 `getAnimalState(status)`로 얻은 상태 객체에 위임한다.
- **전후 비교:** 커밋 `2205314`.
- **함께 적용:** 같은 규칙을 `firestore.rules`의 `validTransition`에도 두어, 화면을 우회한 요청도 서버에서 거절한다.

### 6. Strategy
- **문제:** 정렬 기준(최근 등록, 개체번호, 나이, 관리 우선)이 늘어날 때마다 목록 화면에 분기가 늘어난다.
- **적용:** 정렬 전략 객체 `{ key, label, compare }`와 문맥 함수 `sortAnimals(animals, strategy)`. 사용자가 선택하면 전략만 바뀐다.

### 7. Factory
- **문제:** 축종마다 적용할 판정 규칙의 종류와 기준값이 다르다(기타 축종은 체온 규칙 없음, 가금류는 체중 감소 기준 완화).
- **적용:** 규칙 객체(`TemperatureRule/FeedDropRule/WeightLossRule`)와 판정기(`AnomalyDetector`), 그리고 축종 설정을 읽어 규칙을 조립하는 `createAnomalyDetector`. 같은 축종의 판정기는 재사용한다.
- **전후 비교:** 커밋 `1acdb19`. 기존 판정 테스트가 리팩터링 후에도 전부 통과했다.

### 8. Chain of Responsibility
- **문제:** 필드마다 "필수 → 형식 → 범위 → 중복"을 순서대로 검사하고, 처음 실패한 단계에서 멈춰야 한다. 폼마다 if/else if 사슬이 반복되었다.
- **적용:** `ValidationHandler(setNext/handle)`, `RuleHandler`, `OptionalHandler`(빈 값이면 사슬 종료), `chain(...)`, `validateFields`. 개체·건강 기록·로그인 검증을 필드별 사슬 스키마로 교체했다.
- **전후 비교:** 커밋 `0301f28`. 기존 오류 메시지와 동작이 같고, 기존 검증 테스트가 전부 통과했다.

### 9. Observer
- **문제:** 기록 저장 후 이상 징후 알림, 저장 완료 안내, 상태 변경 안내가 필요하다. 저장 코드가 알림 UI를 직접 호출하면 반응을 추가할 때마다 저장 코드를 고쳐야 한다.
- **적용:** `EventBus`(Subject)의 `subscribe/publish`. `livestockService`가 `RECORD_CREATED`, `ANOMALY_DETECTED`, `ANIMAL_STATUS_CHANGED`, `ANIMAL_CREATED`를 발행하고, `NotificationCenter`가 구독해 토스트를 띄운다.
- **검증:** 서비스 테스트가 가짜 저장소와 새 이벤트 버스로 발행 여부를 확인한다.

### 10. Decorator
- **문제:** 화면을 오갈 때마다 같은 데이터를 다시 읽어 응답이 느리고, 무료 요금제 읽기 한도를 소모한다.
- **적용:** `withCache(repository, options)`가 저장소와 같은 메서드를 가진 객체로 감싼다. 조회 결과를 30초 캐시하고, 동시 요청을 합치고, 쓰기 후에는 캐시를 비운다. 캐시는 사용자 UID별로 분리한다. 화면·서비스 코드는 바뀌지 않는다.
- **한계:** 다른 기기에서 바꾼 데이터는 최대 30초 늦게 보인다.
