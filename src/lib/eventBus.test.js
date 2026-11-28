import { describe, it, expect, vi } from 'vitest';
import { EventBus } from './eventBus';

describe('Observer 패턴 - EventBus', () => {
  it('구독한 모든 핸들러에 payload를 전달', () => {
    const bus = new EventBus();
    const a = vi.fn();
    const b = vi.fn();
    bus.subscribe('x', a);
    bus.subscribe('x', b);
    bus.publish('x', { id: 1 });
    expect(a).toHaveBeenCalledWith({ id: 1 });
    expect(b).toHaveBeenCalledWith({ id: 1 });
  });

  it('다른 이벤트의 구독자는 호출하지 않음', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.subscribe('x', handler);
    bus.publish('y', {});
    expect(handler).not.toHaveBeenCalled();
  });

  it('구독 해제 후에는 호출하지 않음', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    const unsubscribe = bus.subscribe('x', handler);
    unsubscribe();
    bus.publish('x', {});
    expect(handler).not.toHaveBeenCalled();
    expect(bus.subscriberCount('x')).toBe(0);
  });

  it('한 구독자가 오류를 던져도 나머지 구독자는 호출됨', () => {
    const bus = new EventBus();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const after = vi.fn();
    bus.subscribe('x', () => {
      throw new Error('boom');
    });
    bus.subscribe('x', after);
    bus.publish('x', {});
    expect(after).toHaveBeenCalled();
    spy.mockRestore();
  });
});
