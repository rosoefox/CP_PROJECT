import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { domainEvents, EVENTS } from '../lib/eventBus';
import { getAnimalState } from '../domain/animalState';

const AUTO_DISMISS_MS = { ok: 4000, warn: 8000, danger: 12000 };

// 도메인 이벤트를 구독해 화면 오른쪽 아래에 알림(토스트)을 띄우는 구독자(Observer)
function NotificationCenter() {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (toast) => {
      const id = ++nextId.current;
      setToasts((prev) => [...prev, { ...toast, id }].slice(-4)); // 최대 4개
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS[toast.level] ?? 5000);
    },
    [dismiss],
  );

  useEffect(() => {
    const unsubscribes = [
      domainEvents.subscribe(EVENTS.ANOMALY_DETECTED, ({ animal, record, alerts, level }) =>
        push({
          level,
          title: `⚠️ ${animal.tagNumber} 이상 징후 (${record.date})`,
          lines: alerts.map((alert) => alert.message),
          link: `/animals/${animal.id}`,
        }),
      ),
      domainEvents.subscribe(EVENTS.RECORD_CREATED, ({ animal, record }) =>
        push({ level: 'ok', title: `${animal.tagNumber} ${record.date} 기록을 저장했습니다.` }),
      ),
      domainEvents.subscribe(EVENTS.ANIMAL_STATUS_CHANGED, ({ animal, to }) =>
        push({ level: 'ok', title: `${animal.tagNumber} 상태를 '${getAnimalState(to).label}'(으)로 변경했습니다.` }),
      ),
      domainEvents.subscribe(EVENTS.ANIMAL_CREATED, ({ animal }) =>
        push({ level: 'ok', title: `${animal.tagNumber} 개체를 등록했습니다.` }),
      ),
    ];
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [push]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.level}`}>
          <div className="toast-body">
            <strong>{toast.title}</strong>
            {toast.lines && (
              <ul>
                {toast.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}
            {toast.link && (
              <Link to={toast.link} onClick={() => dismiss(toast.id)}>
                개체 보기
              </Link>
            )}
          </div>
          <button className="toast-close" onClick={() => dismiss(toast.id)} aria-label="알림 닫기">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default NotificationCenter;
