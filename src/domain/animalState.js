// [State 패턴] 개체의 생애 상태(사육 중 → 치료 중 → 출하/폐사)를 클래스로 표현합니다.
//
// 상태마다 "다음으로 갈 수 있는 상태", "건강 기록 추가 가능 여부", "변경 전 확인 문구"가 다릅니다.
// 이를 if/switch로 화면 곳곳에 흩어 두는 대신, 각 상태 객체가 자기 규칙을 직접 답하게 합니다.
//   - Context  : 개체(animal.status) — getAnimalState(status)로 현재 상태 객체를 얻어 위임
//   - State    : AnimalState (공통 인터페이스)
//   - Concrete : ActiveState / TreatmentState / ShippedState / DeadState
// 새 상태(예: 격리 중)를 추가할 때 기존 화면 코드를 고치지 않고 클래스 하나만 추가하면 됩니다.

export class AnimalState {
  constructor(key, label, tone) {
    this.key = key;
    this.label = label;
    this.tone = tone; // 배지 색상
  }

  /** 이 상태에서 바로 변경할 수 있는 상태 키 목록 */
  allowedNext() {
    return [];
  }

  /** 출하·폐사처럼 더 이상 변경할 수 없는 종료 상태인지 */
  get isTerminal() {
    return false;
  }

  /** 새 건강 기록을 추가할 수 있는지 */
  canAddRecord() {
    return !this.isTerminal;
  }

  canChangeTo(nextKey) {
    return this.allowedNext().includes(nextKey);
  }

  /**
   * 다음 상태로 전이합니다. 허용되지 않은 전이면 오류를 던집니다.
   * @returns {AnimalState} 다음 상태 객체
   */
  changeTo(nextKey) {
    const next = getAnimalState(nextKey);
    if (!this.canChangeTo(nextKey)) {
      throw new Error(`'${this.label}' 상태에서는 '${next.label}'(으)로 변경할 수 없습니다.`);
    }
    return next;
  }

  /** 이 상태로 바꾸기 전에 사용자에게 확인받을 문구. 없으면 null */
  confirmMessage() {
    return null;
  }
}

class ActiveState extends AnimalState {
  constructor() {
    super('active', '사육 중', 'ok');
  }

  allowedNext() {
    return ['treatment', 'shipped', 'dead'];
  }
}

class TreatmentState extends AnimalState {
  constructor() {
    super('treatment', '치료 중', 'warn');
  }

  allowedNext() {
    return ['active', 'shipped', 'dead'];
  }
}

// 종료 상태 공통 동작: 전이 불가, 기록 추가 불가, 변경 전 확인 필요
class TerminalState extends AnimalState {
  get isTerminal() {
    return true;
  }

  confirmMessage() {
    return `'${this.label}' 처리 후에는 상태 변경과 기록 추가가 불가능합니다. 계속할까요?`;
  }
}

class ShippedState extends TerminalState {
  constructor() {
    super('shipped', '출하', 'muted');
  }
}

class DeadState extends TerminalState {
  constructor() {
    super('dead', '폐사', 'danger');
  }
}

// 상태 객체는 내부 데이터가 없으므로 상태별로 하나씩만 만들어 공유합니다.
const STATES = {
  active: new ActiveState(),
  treatment: new TreatmentState(),
  shipped: new ShippedState(),
  dead: new DeadState(),
};

/** 상태 키(Firestore에 저장된 문자열)로 상태 객체를 얻습니다. 알 수 없는 값은 '사육 중'으로 처리합니다. */
export function getAnimalState(key) {
  return STATES[key] ?? STATES.active;
}

/** 필터 등에 쓸 전체 상태 목록 */
export const ANIMAL_STATES = Object.values(STATES);
