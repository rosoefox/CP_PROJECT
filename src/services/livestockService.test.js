import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLivestockService } from './livestockService';
import { EventBus, EVENTS } from '../lib/eventBus';

// Firestore 대신 쓰는 가짜 저장소
function fakeRepositories() {
  return {
    animalRepository: {
      create: vi.fn(async (data) => ({ ...data, id: 'a1', status: 'active' })),
      update: vi.fn(async (id, changes) => ({ id, species: 'cattle', ...changes })),
    },
    recordRepository: {
      create: vi.fn(async (animalId, data) => ({ ...data, id: `${animalId}_${data.date}`, animalId })),
    },
  };
}

describe('livestockService', () => {
  let repos;
  let events;
  let service;

  beforeEach(() => {
    repos = fakeRepositories();
    events = new EventBus();
    service = createLivestockService({ ...repos, events });
  });

  it('정상 기록은 저장 후 RECORD_CREATED만 발행', async () => {
    const created = vi.fn();
    const anomaly = vi.fn();
    events.subscribe(EVENTS.RECORD_CREATED, created);
    events.subscribe(EVENTS.ANOMALY_DETECTED, anomaly);

    const animal = { id: 'a1', species: 'cattle', status: 'active' };
    const { alerts } = await service.addHealthRecord(animal, { date: '2026-11-20', temperature: 38.5 }, []);

    expect(repos.recordRepository.create).toHaveBeenCalledWith('a1', { date: '2026-11-20', temperature: 38.5 });
    expect(alerts).toEqual([]);
    expect(created).toHaveBeenCalledTimes(1);
    expect(anomaly).not.toHaveBeenCalled();
  });

  it('이상 징후가 있으면 ANOMALY_DETECTED를 위험 수준과 함께 발행', async () => {
    const anomaly = vi.fn();
    events.subscribe(EVENTS.ANOMALY_DETECTED, anomaly);

    const animal = { id: 'a1', species: 'cattle', status: 'treatment' };
    await service.addHealthRecord(animal, { date: '2026-11-20', temperature: 40.5 }, []);

    expect(anomaly).toHaveBeenCalledTimes(1);
    expect(anomaly.mock.calls[0][0]).toMatchObject({ level: 'danger', animal });
  });

  it('출하·폐사 개체는 저장하지 않고 오류', async () => {
    const animal = { id: 'a1', species: 'cattle', status: 'dead' };
    await expect(service.addHealthRecord(animal, { date: '2026-11-20', temperature: 38.5 }, [])).rejects.toThrow(
      '폐사 처리된 개체',
    );
    expect(repos.recordRepository.create).not.toHaveBeenCalled();
  });

  it('상태 변경: 허용된 전이는 저장 후 ANIMAL_STATUS_CHANGED 발행', async () => {
    const changed = vi.fn();
    events.subscribe(EVENTS.ANIMAL_STATUS_CHANGED, changed);

    await service.changeStatus({ id: 'a1', status: 'active' }, 'treatment');

    expect(repos.animalRepository.update).toHaveBeenCalledWith('a1', { status: 'treatment' });
    expect(changed.mock.calls[0][0]).toMatchObject({ from: 'active', to: 'treatment' });
  });

  it('상태 변경: 허용되지 않은 전이는 저장하지 않음', async () => {
    await expect(service.changeStatus({ id: 'a1', status: 'shipped' }, 'active')).rejects.toThrow();
    expect(repos.animalRepository.update).not.toHaveBeenCalled();
  });
});
