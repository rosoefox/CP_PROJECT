// [Observer 패턴] 도메인 이벤트 발행·구독
//
// 건강 기록 저장, 이상 징후 발견, 상태 변경 같은 일이 생겼을 때
// 그 일을 처리한 코드(서비스)가 "누가 이 소식을 필요로 하는지" 알지 않아도 되게 합니다.
//   - Subject  : EventBus — subscribe(구독 등록·해제) / publish(구독자 전체에 통지)
//   - Observer : 이벤트 핸들러 함수 (예: NotificationCenter의 토스트 표시)
// 알림 외에 새 반응(예: 통계 갱신, 로그 기록)이 필요하면 구독자만 추가하고 발행 코드는 그대로 둡니다.

export const EVENTS = {
  ANIMAL_CREATED: 'animal.created',
  ANIMAL_STATUS_CHANGED: 'animal.statusChanged',
  RECORD_CREATED: 'record.created',
  ANOMALY_DETECTED: 'anomaly.detected',
};

export class EventBus {
  constructor() {
    this.handlers = new Map(); // 이벤트 이름 → 핸들러 Set
  }

  /** 구독을 등록하고, 구독 해제 함수를 반환합니다. */
  subscribe(event, handler) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event).add(handler);
    return () => this.handlers.get(event)?.delete(handler);
  }

  /** 이벤트를 구독자 전체에 통지합니다. 한 구독자의 오류가 다른 구독자에게 영향을 주지 않습니다. */
  publish(event, payload) {
    for (const handler of [...(this.handlers.get(event) ?? [])]) {
      try {
        handler(payload);
      } catch (error) {
        console.error(`[EventBus] '${event}' 처리 중 오류`, error);
      }
    }
  }

  subscriberCount(event) {
    return this.handlers.get(event)?.size ?? 0;
  }
}

// 앱 전체가 같은 이벤트 버스를 공유해야 발행자와 구독자가 연결되므로 하나만 생성합니다. (Singleton)
export const domainEvents = new EventBus();
